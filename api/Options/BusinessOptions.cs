namespace KoolFruits.Api.Options;

public class BusinessOptions
{
    public const string SectionName = "Business";

    public required string Name { get; set; }
    public required string Tagline { get; set; }
    public required string WhatsAppNumber { get; set; }
    public required string Currency { get; set; }
}
