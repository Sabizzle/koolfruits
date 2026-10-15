namespace KoolFruits.Api.Services;

/// <summary>
/// Jamaica does not observe daylight saving time, so a fixed UTC-5 offset is safe without
/// needing a full IANA timezone database lookup.
/// </summary>
public static class JamaicaClock
{
    public static readonly TimeSpan Offset = TimeSpan.FromHours(-5);

    /// <summary>The current date in Jamaica, as a UTC instant representing that day's midnight.</summary>
    public static DateTime TodayStartUtc()
    {
        var nowJamaica = DateTime.UtcNow + Offset;
        return nowJamaica.Date - Offset;
    }

    /// <summary>Midnight Monday of the current Jamaica week, as a UTC instant.</summary>
    public static DateTime ThisWeekStartUtc()
    {
        var todayStart = TodayStartUtc();
        var nowJamaica = DateTime.UtcNow + Offset;
        var daysSinceMonday = ((int)nowJamaica.DayOfWeek + 6) % 7;
        return todayStart.AddDays(-daysSinceMonday);
    }

    /// <summary>Midnight on the 1st of the current Jamaica month, as a UTC instant.</summary>
    public static DateTime ThisMonthStartUtc()
    {
        var nowJamaica = DateTime.UtcNow + Offset;
        var monthStartJamaica = new DateTime(nowJamaica.Year, nowJamaica.Month, 1);
        return monthStartJamaica - Offset;
    }
}
