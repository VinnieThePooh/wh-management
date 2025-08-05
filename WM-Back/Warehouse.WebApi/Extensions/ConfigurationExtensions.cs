using Microsoft.Extensions.Options;
using Warehouse.WebApi.Settings;

namespace Warehouse.WebApi.Extensions;

public static class ConfigurationExtensions
{
    public static IServiceCollection ConfigureSingletonSettings<T>(WebApplicationBuilder applicationBuilder) where T : class, ISettings
    {
        applicationBuilder.Services.Configure<T>(applicationBuilder.Configuration.GetSection(T.SectionKey));
        applicationBuilder.Services.AddSingleton<T>(x => x.GetRequiredService<IOptions<T>>().Value);
        return applicationBuilder.Services;
    }
}