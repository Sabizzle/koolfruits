using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using KoolFruits.Api.Models;

namespace KoolFruits.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<DeliveryArea> DeliveryAreas => Set<DeliveryArea>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    // SQLite can't translate comparisons/ordering on DateTimeOffset, so every date in this
    // app is stored as UTC DateTime. This converter makes sure values read back from the
    // database always come back with Kind=Utc (ADO.NET providers otherwise return Unspecified),
    // so JSON serialization and any later arithmetic treat them correctly.
    private static readonly ValueConverter<DateTime, DateTime> UtcDateTimeConverter = new(
        v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
        v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(UtcDateTimeConverter);
                }
            }
        }

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(p => p.Price).HasPrecision(10, 2);
        });

        modelBuilder.Entity<DeliveryArea>(entity =>
        {
            entity.Property(a => a.DeliveryFee).HasPrecision(10, 2);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(c => c.Phone);
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(o => o.OrderNumber).IsUnique();

            entity.Property(o => o.DeliveryFee).HasPrecision(10, 2);
            entity.Property(o => o.Subtotal).HasPrecision(10, 2);
            entity.Property(o => o.Total).HasPrecision(10, 2);

            entity.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(o => o.PaymentMethod).HasConversion<string>().HasMaxLength(20);
            entity.Property(o => o.PreferredTime).HasConversion<string>().HasMaxLength(20);

            entity.HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.DeliveryArea)
                .WithMany(a => a.Orders)
                .HasForeignKey(o => o.DeliveryAreaId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(i => i.UnitPrice).HasPrecision(10, 2);
            entity.Property(i => i.LineTotal).HasPrecision(10, 2);

            entity.HasOne(i => i.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
