using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Route("api/delivery-areas")]
public class DeliveryAreasController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<DeliveryAreaDto>>> GetDeliveryAreas()
    {
        var areas = await db.DeliveryAreas
            .Where(a => a.IsActive)
            .OrderBy(a => a.SortOrder)
            .Select(a => new DeliveryAreaDto(a.Id, a.Name, a.DeliveryFee))
            .ToListAsync();

        return Ok(areas);
    }
}
