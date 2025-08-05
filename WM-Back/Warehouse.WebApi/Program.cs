using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Warehouse.DataAccess;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Settings;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default");
var corsSettings = builder.Configuration.GetSection(CorsSettings.SectionKey).Get<CorsSettings>();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddDbContextFactory<WarehouseContext>(options =>
{
    options.UseNpgsql(connectionString)
        .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
});
builder.Services
    .AddWarehouseServices()
    .AddWarehouseValidators()
    .AddCors(options =>
    {
        options.AddPolicy(options.DefaultPolicyName, policy =>
        {
            policy.WithOrigins(corsSettings.AllowedOrigin)
                .AllowAnyHeader()
                .AllowCredentials()
                .AllowAnyMethod();
        });
    });
    

var app = builder.Build();

var factory = app.Services.GetRequiredService<IDbContextFactory<WarehouseContext>>();
await using (var context = factory.CreateDbContext())
    await context.Database.MigrateAsync();

app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors();
app.MapControllers();
app.Run();