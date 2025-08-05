using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Warehouse.DataAccess.Models;

namespace Warehouse.DataAccess.Configurations;

public class WithdrawalConfiguration : IEntityTypeConfiguration<ResourceWithdrawal>
{
    public void Configure(EntityTypeBuilder<ResourceWithdrawal> builder)
    {
        builder.ToTable("ResourceWithdrawals");
        builder.HasKey(x => x.Id);
        builder.HasOne<WithdrawalDocument>(x => x.Document)
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