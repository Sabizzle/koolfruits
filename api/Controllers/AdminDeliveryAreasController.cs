using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;
using KoolFruits.Api.Models;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/delivery-areas")]
public class AdminDeliveryAreasController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AdminDeliveryAreaDto>>> GetAreas()
    {
        var areas = await db.DeliveryAreas
            .OrderBy(a => a.SortOrder)
            .Select(a => new AdminDeliveryAreaDto(a.Id, a.Name, a.DeliveryFee, a.IsActive, a.SortOrder))
            .ToListAsync();

        return Ok(areas);
    }

    [HttpPost]
    public async Task<ActionResult<AdminDeliveryAreaDto>> CreateArea(UpsertDeliveryAreaRequest request)
    {
        var maxSortOrder = await db.DeliveryAreas.Select(a => (int?)a.SortOrder).MaxAsync() ?? 0;

        var area = new DeliveryArea
        {
            Name = request.Name,
            DeliveryFee = request.DeliveryFee,
            IsActive = request.IsActive,
            SortOrder = maxSortOrder + 1,
        };

        db.DeliveryAreas.Add(area);
        await db.SaveChangesAsync();

        return Ok(new AdminDeliveryAreaDto(area.Id, area.Name, area.DeliveryFee, area.IsActive, area.SortOrder));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminDeliveryAreaDto>> UpdateArea(int id, UpsertDeliveryAreaRequest request)
    {
        var area = await db.DeliveryAreas.FindAsync(id);
        if (area is null)
        {
            return NotFound();
        }

        area.Name = request.Name;
        area.DeliveryFee = request.DeliveryFee;
        area.IsActive = request.IsActive;
        await db.SaveChangesAsync();

        return Ok(new AdminDeliveryAreaDto(area.Id, area.Name, area.DeliveryFee, area.IsActive, area.SortOrder));
    }
}
