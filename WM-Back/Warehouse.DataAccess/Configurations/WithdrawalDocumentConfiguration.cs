using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Warehouse.DataAccess.Models;

namespace Warehouse.DataAccess.Configurations;

public class WithdrawalDocumentConfiguration :  IEntityTypeConfiguration<WithdrawalDocument>
{
    public void Configure(EntityTypeBuilder<WithdrawalDocument> builder)
    {
        builder.ToTable("WithdrawalDocuments");
        builder.HasKey(sd => sd.Id);
        builder.Property(sd => sd.Number).IsRequired().HasMaxLength(200);
        builder.HasIndex(sd => sd.Number).IsUnique();

        builder
            .HasOne(x => x.Customer)
            .WithMany(x => x.WithdrawalDocuments).HasForeignKey(x => x.CustomerId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Property(x => x.WithdrawalDate).IsRequired();
    }
}