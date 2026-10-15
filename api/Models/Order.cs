namespace KoolFruits.Api.Models;

public class Order
{
    public int Id { get; set; }
    public required string OrderNumber { get; set; }

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    // Snapshots of customer-entered info at time of order, so later edits to
    // the Customer record don't change what was actually delivered/agreed.
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }

    public int? DeliveryAreaId { get; set; }
    public DeliveryArea? DeliveryArea { get; set; }
    public string? DeliveryAreaName { get; set; }
    public decimal DeliveryFee { get; set; }

    public required string StreetAddress { get; set; }
    public string? LandmarkDirections { get; set; }

    public PreferredTimeType PreferredTime { get; set; }

    /// <summary>UTC. Set from the customer's local time when PreferredTime is Scheduled.</summary>
    public DateTime? ScheduledTime { get; set; }

    public PaymentMethod PaymentMethod { get; set; }
    public string? Note { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.New;
    public bool IsPaid { get; set; }

    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
