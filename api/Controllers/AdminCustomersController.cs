using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/customers")]
public class AdminCustomersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CustomerSummaryDto>>> GetCustomers()
    {
        var customers = await db.Customers
            .Include(c => c.Orders)
            .ToListAsync();

        var summaries = customers
            .Select(c => new CustomerSummaryDto(
                c.Id,
                c.Name,
                c.Phone,
                c.Orders
                    .Select(o => string.IsNullOrWhiteSpace(o.DeliveryAreaName) ? o.StreetAddress : $"{o.StreetAddress} ({o.DeliveryAreaName})")
                    .Distinct()
                    .ToList(),
                c.Orders.Count,
                c.Orders.Sum(o => o.Total),
                c.Orders.Count > 0 ? c.Orders.Max(o => o.CreatedAt) : c.CreatedAt
            ))
            .OrderByDescending(c => c.LastOrderAt)
            .ToList();

        return Ok(summaries);
    }
}
