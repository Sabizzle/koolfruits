using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KoolFruits.Api.Data;
using KoolFruits.Api.Dtos;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/products")]
public class AdminProductsController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    private static readonly Dictionary<string, string> AllowedContentTypes = new()
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
    };

    private const long MaxPhotoBytes = 5 * 1024 * 1024;

    [HttpGet]
    public async Task<ActionResult<List<AdminProductDto>>> GetProducts()
    {
        var products = await db.Products
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new AdminProductDto(p.Id, p.Name, p.Description, p.Price, p.PhotoUrl, p.SoldOut, p.SortOrder))
            .ToListAsync();

        return Ok(products);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminProductDto>> UpdateProduct(int id, UpdateProductRequest request)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        await db.SaveChangesAsync();

        return Ok(product.ToAdminDto());
    }

    [HttpPatch("{id:int}/sold-out")]
    public async Task<ActionResult<AdminProductDto>> UpdateSoldOut(int id, UpdateProductSoldOutRequest request)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        product.SoldOut = request.SoldOut;
        await db.SaveChangesAsync();

        return Ok(product.ToAdminDto());
    }

    [HttpPost("{id:int}/photo")]
    [RequestSizeLimit(MaxPhotoBytes)]
    public async Task<ActionResult<AdminProductDto>> UploadPhoto(int id, IFormFile file)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        if (file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        if (file.Length > MaxPhotoBytes)
        {
            return BadRequest(new { message = "Photo must be 5 MB or smaller." });
        }

        if (!AllowedContentTypes.TryGetValue(file.ContentType, out var extension))
        {
            return BadRequest(new { message = "Photo must be a JPEG, PNG, or WebP image." });
        }

        var photoDir = Path.Combine(env.WebRootPath, "product-photos");
        Directory.CreateDirectory(photoDir);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(photoDir, fileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var previousPhotoUrl = product.PhotoUrl;
        product.PhotoUrl = $"/product-photos/{fileName}";
        await db.SaveChangesAsync();

        TryDeleteOldPhoto(previousPhotoUrl);

        return Ok(product.ToAdminDto());
    }

    private void TryDeleteOldPhoto(string? photoUrl)
    {
        if (string.IsNullOrEmpty(photoUrl) || !photoUrl.StartsWith("/product-photos/"))
        {
            return;
        }

        try
        {
            var fileName = Path.GetFileName(photoUrl);
            var path = Path.Combine(env.WebRootPath, "product-photos", fileName);
            if (System.IO.File.Exists(path))
            {
                System.IO.File.Delete(path);
            }
        }
        catch (IOException)
        {
            // Best-effort cleanup — an orphaned file on disk isn't worth failing the request over.
        }
    }
}
