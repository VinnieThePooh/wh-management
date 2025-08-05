namespace Warehouse.WebApi.Settings;

public class CorsSettings : ISettings
{
    public string AllowedOrigin { get; set; }

    public static string SectionKey => "Cors";
}