using System.ComponentModel.DataAnnotations;
using KoolFruits.Api.Models;

namespace KoolFruits.Api.Dtos;

public record AdminOrderDto(
    int Id,
    string OrderNumber,
    OrderStatus Status,
    bool IsPaid,
    string CustomerName,
    string CustomerPhone,
    string? DeliveryAreaName,
    decimal DeliveryFee,
    string StreetAddress,
    string? LandmarkDirections,
    PreferredTimeType PreferredTime,
    DateTime? ScheduledTime,
    PaymentMethod PaymentMethod,
    string? Note,
    decimal Subtotal,
    decimal Total,
    DateTime CreatedAt,
    List<OrderItemResponse> Items
);

public class UpdateOrderStatusRequest
{
    [Required]
    public OrderStatus Status { get; set; }
}

public class UpdateOrderPaidRequest
{
    [Required]
    public bool IsPaid { get; set; }
}
