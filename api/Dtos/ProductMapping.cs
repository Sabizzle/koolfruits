using KoolFruits.Api.Models;

namespace KoolFruits.Api.Dtos;

public static class ProductMapping
{
    public static AdminProductDto ToAdminDto(this Product product) =>
        new(product.Id, product.Name, product.Description, product.Price, product.PhotoUrl, product.SoldOut, product.SortOrder);
}
