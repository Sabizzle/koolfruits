namespace KoolFruits.Api.Dtos;

public record CustomerSummaryDto(
    int Id,
    string Name,
    string Phone,
    List<string> Addresses,
    int OrderCount,
    decimal TotalSpent,
    DateTime LastOrderAt
);
