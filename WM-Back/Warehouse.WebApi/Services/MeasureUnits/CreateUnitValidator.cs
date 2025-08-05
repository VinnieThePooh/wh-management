using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Models.MeasureUnits;

namespace Warehouse.WebApi.Services.MeasureUnits;

public class CreateUnitValidator : AbstractValidator<CreateMeasureUnitRequest>
{
    public CreateUnitValidator(IDbContextFactory<WarehouseContext> factory)
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Unit name should not be empty")
            .MustAsync(async (name, token) =>
            {
                await using var context = factory.CreateDbContext();
                var exists = await context.MeasureUnits.AnyAsync(x => x.Name == name, token);
                return !exists;
                
            }).WithMessage("Measure unit with such name already exists");
    }
}