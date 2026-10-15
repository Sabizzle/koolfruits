using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;
using KoolFruits.Api.Models;
using KoolFruits.Api.Services;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/sales-summary")]
public class AdminSalesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SalesSummaryDto>> GetSummary()
    {
        var monthStart = JamaicaClock.ThisMonthStartUtc();

        // The month always contains the week, which always contains the day, so one query
        // from the earliest boundary covers all three periods.
        var orders = await db.Orders
            .Include(o => o.Items)
            .Where(o => o.CreatedAt >= monthStart)
            .ToListAsync();

        var todayStart = JamaicaClock.TodayStartUtc();
        var weekStart = JamaicaClock.ThisWeekStartUtc();

        return Ok(new SalesSummaryDto(
            Summarize(orders.Where(o => o.CreatedAt >= todayStart)),
            Summarize(orders.Where(o => o.CreatedAt >= weekStart)),
            Summarize(orders)
        ));
    }

    private static SalesPeriodDto Summarize(IEnumerable<Order> orders)
    {
        var orderList = orders.ToList();

        var items = orderList
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ProductName)
            .Select(g => new ProductSalesDto(g.Key, g.Sum(i => i.Quantity), g.Sum(i => i.LineTotal)))
            .OrderByDescending(p => p.Quantity)
            .ToList();

        return new SalesPeriodDto(orderList.Sum(o => o.Total), orderList.Count, items);
    }
}
