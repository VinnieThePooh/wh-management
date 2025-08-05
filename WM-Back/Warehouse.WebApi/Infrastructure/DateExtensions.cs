namespace Warehouse.WebApi.Infrastructure;

public static class DateExtensions
{
    /// <summary>
    /// Returns UTC time trace which points to the end of a given local day
    /// </summary>
    /// <param name="date"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    public static DateTime CaptureWholeLocalDay(this DateTime date)
    {
        if (date.Kind == DateTimeKind.Utc)
            throw new ArgumentException("Only local timezone is accepted");

        return date.Date.AddDays(1).ToUniversalTime();
    }
}