namespace KoolFruits.Api.Models;

public class DeliveryArea
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal DeliveryFee { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
