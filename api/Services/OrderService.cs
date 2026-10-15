using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;
using KoolFruits.Api.Models;

namespace KoolFruits.Api.Services;

public class OrderService(AppDbContext db, IBackgroundTaskQueue taskQueue, ILogger<OrderService> logger)
{
    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        if (request.PreferredTime == PreferredTimeType.Scheduled && request.ScheduledTime is null)
        {
            throw new OrderValidationException(nameof(request.ScheduledTime), "Scheduled time is required when preferred time is 'Scheduled'.");
        }

        var area = await db.DeliveryAreas.FirstOrDefaultAsync(a => a.Id == request.DeliveryAreaId && a.IsActive);
        if (area is null)
        {
            throw new OrderValidationException(nameof(request.DeliveryAreaId), "Selected delivery area is not valid.");
        }

        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id);

        foreach (var item in request.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
            {
                throw new OrderValidationException(nameof(request.Items), $"Product {item.ProductId} is not valid.");
            }

            if (product.SoldOut)
            {
                throw new OrderValidationException(nameof(request.Items), $"'{product.Name}' is sold out.");
            }
        }

        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Phone == request.CustomerPhone);
        if (customer is null)
        {
            customer = new Customer { Name = request.CustomerName, Phone = request.CustomerPhone };
            db.Customers.Add(customer);
        }
        else
        {
            customer.Name = request.CustomerName;
        }

        var orderItems = request.Items.Select(i =>
        {
            var product = products[i.ProductId];
            var lineTotal = product.Price * i.Quantity;
            return new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = i.Quantity,
                LineTotal = lineTotal,
            };
        }).ToList();

        var subtotal = orderItems.Sum(i => i.LineTotal);
        var total = subtotal + area.DeliveryFee;

        var order = new Order
        {
            OrderNumber = string.Empty,
            Customer = customer,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            DeliveryArea = area,
            DeliveryAreaName = area.Name,
            DeliveryFee = area.DeliveryFee,
            StreetAddress = request.StreetAddress,
            LandmarkDirections = request.LandmarkDirections,
            PreferredTime = request.PreferredTime,
            ScheduledTime = request.ScheduledTime,
            PaymentMethod = request.PaymentMethod,
            Note = request.Note,
            Subtotal = subtotal,
            Total = total,
            Items = orderItems,
        };

        db.Orders.Add(order);

        const int maxAttempts = 5;
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            order.OrderNumber = await NextOrderNumberAsync();
            try
            {
                await db.SaveChangesAsync();
                break;
            }
            catch (DbUpdateException) when (attempt < maxAttempts)
            {
                logger.LogWarning("Order number collision on {OrderNumber}, retrying", order.OrderNumber);
                db.Entry(order).State = EntityState.Added;
            }
        }

        var orderId = order.Id;
        taskQueue.Enqueue(async (services, ct) =>
        {
            var notifier = services.GetRequiredService<OrderNotificationService>();
            await notifier.NotifyNewOrderAsync(orderId, ct);
        });

        return order;
    }

    private async Task<string> NextOrderNumberAsync()
    {
        // Based on the last-created order's own number, not a row count — a row count
        // silently desyncs from reality the moment any order is ever deleted (even a
        // one-off manual cleanup), permanently colliding with an existing number and
        // making every subsequent order fail. Using Id (always unique, never reused)
        // keyed to the most recent row is immune to that.
        var lastOrderNumber = await db.Orders
            .OrderByDescending(o => o.Id)
            .Select(o => o.OrderNumber)
            .FirstOrDefaultAsync();

        var nextSequence = 1;
        if (lastOrderNumber is not null
            && lastOrderNumber.StartsWith("KF-", StringComparison.Ordinal)
            && int.TryParse(lastOrderNumber.AsSpan(3), out var lastSequence))
        {
            nextSequence = lastSequence + 1;
        }

        return $"KF-{nextSequence:D5}";
    }
}
