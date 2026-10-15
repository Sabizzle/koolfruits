using System.ComponentModel.DataAnnotations;

namespace KoolFruits.Api.Dtos;

public record AdminProductDto(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    string? PhotoUrl,
    bool SoldOut,
    int SortOrder
);

public class UpdateProductRequest
{
    [Required, MaxLength(100)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [Range(0, 1_000_000)]
    public decimal Price { get; set; }
}

public class UpdateProductSoldOutRequest
{
    [Required]
    public bool SoldOut { get; set; }
}
