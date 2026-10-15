using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using KoolFruits.Api.Models;
using KoolFruits.Api.Options;

namespace KoolFruits.Api.Services;

public class EmailNotifier(IHttpClientFactory httpClientFactory, IOptions<EmailOptions> options, IOptions<BusinessOptions> business, ILogger<EmailNotifier> logger)
{
    private const string ResendEndpoint = "https://api.resend.com/emails";

    public async Task SendNewOrderEmailAsync(Order order, CancellationToken ct = default)
    {
        var opts = options.Value;
        if (!opts.IsConfigured)
        {
            logger.LogInformation("Email notifications are not configured — skipping email for order {OrderNumber}.", order.OrderNumber);
            return;
        }

        var client = httpClientFactory.CreateClient(nameof(EmailNotifier));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", opts.ResendApiKey);

        var payload = new
        {
            from = opts.FromAddress,
            to = new[] { opts.RecipientAddress },
            subject = $"New order {order.OrderNumber} — {business.Value.Name}",
            text = BuildBody(order),
        };

        var response = await client.PostAsJsonAsync(ResendEndpoint, payload, ct);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning(
                "Resend returned {StatusCode} for order {OrderNumber}: {Body}",
                response.StatusCode, order.OrderNumber, body);
        }
    }

    private static string BuildBody(Order order)
    {
        var lines = new List<string>
        {
            $"New order: {order.OrderNumber}",
            $"Placed: {order.CreatedAt:yyyy-MM-dd HH:mm} UTC",
            "",
            $"Customer: {order.CustomerName}",
            $"Phone: {order.CustomerPhone}",
            $"Address: {order.StreetAddress}" + (string.IsNullOrWhiteSpace(order.LandmarkDirections) ? "" : $" ({order.LandmarkDirections})"),
            $"Area: {order.DeliveryAreaName}",
            $"Delivery: {(order.PreferredTime == PreferredTimeType.Asap ? "ASAP" : $"Scheduled for {order.ScheduledTime:yyyy-MM-dd HH:mm}")}",
            $"Payment: {(order.PaymentMethod == PaymentMethod.CashOnDelivery ? "Cash on delivery" : "Bank transfer")}",
            "",
            "Items:",
        };

        lines.AddRange(order.Items.Select(i => $"  {i.Quantity} x {i.ProductName} — {i.LineTotal:0.##}"));

        lines.Add("");
        lines.Add($"Subtotal: {order.Subtotal:0.##}");
        lines.Add($"Delivery fee: {order.DeliveryFee:0.##}");
        lines.Add($"Total: {order.Total:0.##}");

        if (!string.IsNullOrWhiteSpace(order.Note))
        {
            lines.Add("");
            lines.Add($"Note: {order.Note}");
        }

        return string.Join('\n', lines);
    }
}
