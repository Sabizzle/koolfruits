using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using KoolFruits.Api.Models;
using KoolFruits.Api.Options;

namespace KoolFruits.Api.Services;

public class GoogleSheetsNotifier(IHttpClientFactory httpClientFactory, IOptions<GoogleSheetsOptions> options, ILogger<GoogleSheetsNotifier> logger)
{
    public async Task AppendOrderRowAsync(Order order, CancellationToken ct = default)
    {
        var opts = options.Value;
        if (!opts.IsConfigured)
        {
            logger.LogInformation("Google Sheets notifications are not configured — skipping row for order {OrderNumber}.", order.OrderNumber);
            return;
        }

        var payload = new
        {
            secret = opts.SharedSecret,
            orderNumber = order.OrderNumber,
            createdAt = order.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
            customerName = order.CustomerName,
            customerPhone = order.CustomerPhone,
            items = string.Join("; ", order.Items.Select(i => $"{i.Quantity} x {i.ProductName}")),
            subtotal = order.Subtotal,
            deliveryFee = order.DeliveryFee,
            total = order.Total,
            paymentMethod = order.PaymentMethod == PaymentMethod.CashOnDelivery ? "Cash on delivery" : "Bank transfer",
            address = order.StreetAddress,
            landmark = order.LandmarkDirections,
            area = order.DeliveryAreaName,
            status = order.Status.ToString(),
        };

        var client = httpClientFactory.CreateClient(nameof(GoogleSheetsNotifier));
        var response = await client.PostAsJsonAsync(opts.WebAppUrl, payload, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning(
                "Google Sheets webhook returned {StatusCode} for order {OrderNumber}: {Body}",
                response.StatusCode, order.OrderNumber, body);
        }
    }
}
