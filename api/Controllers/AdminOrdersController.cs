using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;
using KoolFruits.Api.Services;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/orders")]
public class AdminOrdersController(AppDbContext db, OrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AdminOrderDto>>> GetOrders([FromQuery] int sinceDays = 2)
    {
        var cutoff = DateTime.UtcNow.AddDays(-sinceDays);

        // Only Delivered orders are subject to the cutoff — anything still active stays on
        // the board no matter how old, so a missed order never silently disappears.
        var orders = await db.Orders
            .Include(o => o.Items)
            .Where(o => o.Status != Models.OrderStatus.Delivered || o.CreatedAt >= cutoff)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(o => o.ToAdminDto()).ToList());
    }

    [HttpGet("today")]
    public async Task<ActionResult<List<AdminOrderDto>>> GetTodayOrders()
    {
        var startOfDay = JamaicaClock.TodayStartUtc();
        var endOfDay = startOfDay.AddDays(1);

        var orders = await db.Orders
            .Include(o => o.Items)
            .Where(o =>
                (o.PreferredTime == Models.PreferredTimeType.Scheduled && o.ScheduledTime >= startOfDay && o.ScheduledTime < endOfDay) ||
                (o.PreferredTime == Models.PreferredTimeType.Asap && o.CreatedAt >= startOfDay && o.CreatedAt < endOfDay))
            .ToListAsync();

        var sorted = orders
            .OrderBy(o => o.PreferredTime == Models.PreferredTimeType.Scheduled ? o.ScheduledTime!.Value : o.CreatedAt)
            .ToList();

        return Ok(sorted.Select(o => o.ToAdminDto()).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<AdminOrderDto>> CreateOrder(CreateOrderRequest request)
    {
        try
        {
            var order = await orderService.CreateOrderAsync(request);
            return Ok(order.ToAdminDto());
        }
        catch (OrderValidationException ex)
        {
            ModelState.AddModelError(ex.Field, ex.Message);
            return ValidationProblem(ModelState);
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<AdminOrderDto>> UpdateStatus(int id, UpdateOrderStatusRequest request)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
        {
            return NotFound();
        }

        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(order.ToAdminDto());
    }

    [HttpPatch("{id:int}/paid")]
    public async Task<ActionResult<AdminOrderDto>> UpdatePaid(int id, UpdateOrderPaidRequest request)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
        {
            return NotFound();
        }

        order.IsPaid = request.IsPaid;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(order.ToAdminDto());
    }
}
