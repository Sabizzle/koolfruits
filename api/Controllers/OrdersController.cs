using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;
using KoolFruits.Api.Services;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(AppDbContext db, OrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(CreateOrderRequest request)
    {
        try
        {
            var order = await orderService.CreateOrderAsync(request);
            return Ok(order.ToResponse());
        }
        catch (OrderValidationException ex)
        {
            ModelState.AddModelError(ex.Field, ex.Message);
            return ValidationProblem(ModelState);
        }
    }

    // Order numbers are sequential and easy to guess, so looking one up also requires the
    // phone number it was placed under — otherwise anyone could enumerate every customer's
    // name, address and phone number by walking KF-00001, KF-00002, ...
    [HttpGet("{orderNumber}")]
    public async Task<ActionResult<OrderResponse>> GetOrder(string orderNumber, [FromQuery] string phone)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order is null || string.IsNullOrEmpty(phone) || order.CustomerPhone != phone)
        {
            return NotFound();
        }

        return Ok(order.ToResponse());
    }
}
