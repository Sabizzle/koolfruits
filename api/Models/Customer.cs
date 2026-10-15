namespace KoolFruits.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Phone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
