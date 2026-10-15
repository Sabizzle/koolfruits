using System.ComponentModel.DataAnnotations;

namespace KoolFruits.Api.Dtos;

public record AdminDeliveryAreaDto(int Id, string Name, decimal DeliveryFee, bool IsActive, int SortOrder);

public class UpsertDeliveryAreaRequest
{
    [Required, MaxLength(100)]
    public required string Name { get; set; }

    [Range(0, 1_000_000)]
    public decimal DeliveryFee { get; set; }

    public bool IsActive { get; set; } = true;
}
