using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Warehouse.DataAccess.Models;

namespace Warehouse.DataAccess.Configurations;

public class SupplyDocumentConfiguration : IEntityTypeConfiguration<SupplyDocument>
{
    public void Configure(EntityTypeBuilder<SupplyDocument> builder)
    {
        builder.ToTable("SupplyDocuments");
        builder.HasKey(sd => sd.Id);
        builder.Property(sd => sd.Number).IsRequired().HasMaxLength(200);
        builder.HasIndex(sd => sd.Number).IsUnique();
    }
}