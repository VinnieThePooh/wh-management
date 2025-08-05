using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Warehouse.DataAccess.Models;

namespace Warehouse.DataAccess.Configurations;

public class ResourceBalanceConfiguration : IEntityTypeConfiguration<ResourceBalance>
{
    public void Configure(EntityTypeBuilder<ResourceBalance> builder)
    {
        builder.ToTable("ResourceBalances");
        builder.HasKey(x => x.Id);
        builder.HasOne(x => x.Resource).WithMany()
            .HasForeignKey(x =>  x.ResourceId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.MeasureUnit).WithMany()
            .HasForeignKey(x =>  x.MeasureUnitId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}