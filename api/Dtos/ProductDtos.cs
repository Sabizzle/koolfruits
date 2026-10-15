namespace KoolFruits.Api.Dtos;

public record ProductDto(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    string? PhotoUrl,
    bool SoldOut
);
