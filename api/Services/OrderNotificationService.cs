using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;

namespace KoolFruits.Api.Services;

public class OrderNotificationService(
    AppDbContext db,
    EmailNotifier emailNotifier,
    GoogleSheetsNotifier sheetsNotifier,
    ILogger<OrderNotificationService> logger)
{
    public async Task NotifyNewOrderAsync(int orderId, CancellationToken ct = default)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order is null)
        {
            logger.LogWarning("NotifyNewOrderAsync called for missing order {OrderId}.", orderId);
            return;
        }

        try
        {
            await emailNotifier.SendNewOrderEmailAsync(order, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send order email for {OrderNumber}.", order.OrderNumber);
        }

        try
        {
            await sheetsNotifier.AppendOrderRowAsync(order, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to append Google Sheets row for {OrderNumber}.", order.OrderNumber);
        }
    }
}
