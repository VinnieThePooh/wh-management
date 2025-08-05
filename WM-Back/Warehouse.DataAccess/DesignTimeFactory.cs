using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Warehouse.DataAccess;

public class DesignTimeFactory : IDesignTimeDbContextFactory<WarehouseContext>
{
    public WarehouseContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WarehouseContext>();
        var connectionString = "User ID=ryan;Host=localhost;Port=5432;Database=WarehouseDb;Pooling=true;";
        optionsBuilder.UseNpgsql(connectionString);
        
        return new WarehouseContext(optionsBuilder.Options);
    }
}