using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess.Configurations;
using Warehouse.DataAccess.Models;

namespace Warehouse.DataAccess;

public class WarehouseContext(DbContextOptions<WarehouseContext> options) : DbContext(options)
{
    public DbSet<WithdrawalDocument> WithdrawalDocuments { get; set;}
    
    public DbSet<SupplyDocument> SupplyDocuments { get; set;}
    
    public DbSet<ResourceBalance> ResourceBalances { get; set;}
    
    public DbSet<MeasureUnitEntity> MeasureUnits { get; set; }
    
    public DbSet<ResourceEntity> Resources { get; set; }
    
    public DbSet<Customer> Customers { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new ResourceConfiguration());
        modelBuilder.ApplyConfiguration(new MeasureUnitConfiguration());
        modelBuilder.ApplyConfiguration(new SupplementConfiguration());
        modelBuilder.ApplyConfiguration(new WithdrawalConfiguration());
        modelBuilder.ApplyConfiguration(new SupplyDocumentConfiguration());
        modelBuilder.ApplyConfiguration(new WithdrawalDocumentConfiguration());
        modelBuilder.ApplyConfiguration(new ResourceBalanceConfiguration());
        modelBuilder.ApplyConfiguration(new CustomerConfiguration());
    }
}