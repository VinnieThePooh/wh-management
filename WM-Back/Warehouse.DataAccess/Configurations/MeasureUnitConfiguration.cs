using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Warehouse.DataAccess.Models;

namespace Warehouse.DataAccess.Configurations;

public class MeasureUnitConfiguration : IEntityTypeConfiguration<MeasureUnitEntity>
{
    public void Configure(EntityTypeBuilder<MeasureUnitEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(x => x.Name).IsUnique();
        builder.Property(x => x.Description).IsRequired(false).HasMaxLength(300);
        builder.HasData([
            new MeasureUnitEntity { Id = 1, Name = "шт", Description = "Штука (одна единица товара)" },
            new MeasureUnitEntity { Id = 2, Name = "л", Description = "Литр (единица измерения емкости жидкостей)" },
            new MeasureUnitEntity { Id = 3, Name = "кг", Description = "Килограмм" },
            new MeasureUnitEntity { Id = 4, Name = "т", Description = "Тонна" },
            new MeasureUnitEntity { Id = 5, Name = "унц", Description = "Унция" },
            new MeasureUnitEntity { Id = 6, Name = "крбк,", Description = "Коробка", IsArchived = true },
        ]);
    }
}