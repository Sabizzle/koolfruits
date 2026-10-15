using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetProducts()
    {
        var products = await db.Products
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.PhotoUrl, p.SoldOut))
            .ToListAsync();

        return Ok(products);
    }
}
