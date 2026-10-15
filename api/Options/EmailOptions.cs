namespace KoolFruits.Api.Options;

/// <summary>
/// Order notification emails are sent via the Resend API (https://resend.com) rather than
/// SMTP — no domain verification needed as long as you're emailing the same address that
/// owns the Resend account (their sandbox sender "onboarding@resend.dev" only delivers to
/// your own verified address until you verify a custom domain).
/// </summary>
public class EmailOptions
{
    public const string SectionName = "Email";

    public string? ResendApiKey { get; set; }
    public string FromAddress { get; set; } = "Kool Fruits <onboarding@resend.dev>";
    public string? RecipientAddress { get; set; }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(ResendApiKey) &&
        !string.IsNullOrWhiteSpace(RecipientAddress);
}
