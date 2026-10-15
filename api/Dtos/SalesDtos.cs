namespace KoolFruits.Api.Dtos;

public record ProductSalesDto(string ProductName, int Quantity, decimal Revenue);

public record SalesPeriodDto(decimal Revenue, int OrderCount, List<ProductSalesDto> Items);

public record SalesSummaryDto(SalesPeriodDto Today, SalesPeriodDto ThisWeek, SalesPeriodDto ThisMonth);
