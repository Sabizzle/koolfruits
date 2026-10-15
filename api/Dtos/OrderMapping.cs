using KoolFruits.Api.Models;

namespace KoolFruits.Api.Dtos;

public static class OrderMapping
{
    public static AdminOrderDto ToAdminDto(this Order order) => new(
        order.Id,
        order.OrderNumber,
        order.Status,
        order.IsPaid,
        order.CustomerName,
        order.CustomerPhone,
        order.DeliveryAreaName,
        order.DeliveryFee,
        order.StreetAddress,
        order.LandmarkDirections,
        order.PreferredTime,
        order.ScheduledTime,
        order.PaymentMethod,
        order.Note,
        order.Subtotal,
        order.Total,
        order.CreatedAt,
        order.Items.Select(i => new OrderItemResponse(i.ProductName, i.UnitPrice, i.Quantity, i.LineTotal)).ToList()
    );

    public static OrderResponse ToResponse(this Order order) => new(
        order.OrderNumber,
        order.Status,
        order.IsPaid,
        order.CustomerName,
        order.CustomerPhone,
        order.DeliveryAreaName,
        order.DeliveryFee,
        order.StreetAddress,
        order.LandmarkDirections,
        order.PreferredTime,
        order.ScheduledTime,
        order.PaymentMethod,
        order.Note,
        order.Subtotal,
        order.Total,
        order.CreatedAt,
        order.Items.Select(i => new OrderItemResponse(i.ProductName, i.UnitPrice, i.Quantity, i.LineTotal)).ToList()
    );
}
