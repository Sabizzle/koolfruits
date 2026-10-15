using KoolFruits.Api.Models;
using KoolFruits.Api.Services;

namespace KoolFruits.Api.Data;

public static class SeedData
{
    public static void Seed(AppDbContext db, IConfiguration config)
    {
        if (!db.Products.Any())
        {
            db.Products.AddRange(
                new Product
                {
                    Name = "Strained Coconut Water",
                    Price = 600m,
                    PhotoUrl = "/product-photos/product1-strained.jpg",
                    SortOrder = 1,
                },
                new Product
                {
                    Name = "Coconut Water with Jelly",
                    Price = 700m,
                    PhotoUrl = "/product-photos/product2-jelly.jpg",
                    SortOrder = 2,
                },
                new Product
                {
                    Name = "Coconut Water with Pineapple",
                    Price = 800m,
                    PhotoUrl = "/product-photos/product3-pineapple.jpg",
                    SortOrder = 3,
                }
            );
        }

        if (!db.DeliveryAreas.Any())
        {
            db.DeliveryAreas.AddRange(
                new DeliveryArea { Name = "Half Way Tree", DeliveryFee = 0m, SortOrder = 1 },
                new DeliveryArea { Name = "New Kingston", DeliveryFee = 0m, SortOrder = 2 },
                new DeliveryArea { Name = "Mona / Papine", DeliveryFee = 200m, SortOrder = 3 },
                new DeliveryArea { Name = "Portmore", DeliveryFee = 500m, SortOrder = 4 },
                new DeliveryArea { Name = "Spanish Town", DeliveryFee = 500m, SortOrder = 5 },
                new DeliveryArea { Name = "Other / Outside Kingston", DeliveryFee = 700m, SortOrder = 6 }
            );
        }

        if (!db.AdminUsers.Any())
        {
            var username = config["Admin:Username"] ?? "admin";
            var password = config["Admin:Password"] ?? "ChangeMe123!";

            db.AdminUsers.Add(new AdminUser
            {
                Username = username,
                PasswordHash = PasswordHasher.Hash(password),
            });
        }

        db.SaveChanges();
    }
}
