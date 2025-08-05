using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Models.MeasureUnits;

namespace Warehouse.WebApi.Services.MeasureUnits;

public class EditUnitValidator: AbstractValidator<EditMeasureUnitRequest>
{
    public EditUnitValidator(IDbContextFactory<WarehouseContext> factory)
        {
            RuleFor(x => x.Id).NotEqual(0).WithMessage("Id cannot be 0");
            RuleFor(x => x.Name).NotEmpty().WithMessage("Unit name should not be empty")
            .MustAsync(async (entity, name, token) =>
                {
                    await using var context = factory.CreateDbContext();
                    var exists = await context.MeasureUnits.AnyAsync(x => x.Name == name && x.Id != entity.Id, token);
                    return !exists;
                
                }).WithMessage("Measure unit with such name already exists");
        }
    }
