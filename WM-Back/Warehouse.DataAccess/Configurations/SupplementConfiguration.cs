using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Warehouse.DataAccess.Models;

namespace Warehouse.DataAccess.Configurations;

public class SupplementConfiguration : IEntityTypeConfiguration<ResourceSupplement>
{
    public void Configure(EntityTypeBuilder<ResourceSupplement> builder)
    {
        builder.ToTable("ResourceSupplements");
        builder.HasKey(x => x.Id);
        builder.HasOne<SupplyDocument>(x => x.Document)
            .WithMany(x => x.Resources)
            .HasForeignKey(x => x.DocumentId)
            .IsRequired();
        
        builder.HasOne<MeasureUnitEntity>(x => x.MeasureUnit).WithMany()
            .HasForeignKey(x => x.MeasureUnitId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne<ResourceEntity>(x => x.Resource).WithMany()
            .HasForeignKey(x => x.ResourceId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}