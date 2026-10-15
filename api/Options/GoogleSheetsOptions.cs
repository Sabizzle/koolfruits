namespace KoolFruits.Api.Options;

/// <summary>
/// Order rows are appended via a Google Apps Script "Web App" deployed from inside the
/// target spreadsheet (Extensions &gt; Apps Script) — no Google Cloud project, service
/// account, or API key needed, just this one URL.
/// </summary>
public class GoogleSheetsOptions
{
    public const string SectionName = "GoogleSheets";

    public string? WebAppUrl { get; set; }
    public string? SharedSecret { get; set; }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(WebAppUrl);
}
