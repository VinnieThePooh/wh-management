using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Models.Resources;

namespace Warehouse.WebApi.Services.Resources;

public class EditResourceValidator : AbstractValidator<EditResourceRequest>
{
    public EditResourceValidator(IDbContextFactory<WarehouseContext> factory)
    {
        RuleFor(x => x.Id).NotEqual(0).WithMessage("Id cannot be 0");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Resource name should not be empty")
            .MustAsync(async (entity, name, token) =>
            {
                await using var context = factory.CreateDbContext();
                var exists = await context.Resources.AnyAsync(x => x.Name == name && x.Id != entity.Id, token);
                return !exists;
            }).WithMessage("Resource with such name already exists");
    }
}