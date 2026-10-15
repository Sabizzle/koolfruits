using System.ComponentModel.DataAnnotations;
using KoolFruits.Api.Models;

namespace KoolFruits.Api.Dtos;

public class CreateOrderItemRequest
{
    [Required]
    public int ProductId { get; set; }

    [Range(1, 50)]
    public int Quantity { get; set; }
}

public class CreateOrderRequest
{
    [Required, MaxLength(100)]
    public required string CustomerName { get; set; }

    [Required, MaxLength(30)]
    public required string CustomerPhone { get; set; }

    [Required]
    public int DeliveryAreaId { get; set; }

    [Required, MaxLength(200)]
    public required string StreetAddress { get; set; }

    [MaxLength(300)]
    public string? LandmarkDirections { get; set; }

    [Required]
    public PreferredTimeType PreferredTime { get; set; }

    public DateTime? ScheduledTime { get; set; }

    [Required]
    public PaymentMethod PaymentMethod { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    [Required, MinLength(1)]
    public required List<CreateOrderItemRequest> Items { get; set; }
}

public record OrderItemResponse(
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal
);

public record OrderResponse(
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
