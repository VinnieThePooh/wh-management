using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Models.Resources;

namespace Warehouse.WebApi.Services.Validators;

public class CreateResourceValidator : AbstractValidator<CreateResourceRequest>
{
    public CreateResourceValidator(IDbContextFactory<WarehouseContext> factory)
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Resource name should not be empty")
            .MustAsync(async (name, token) =>
            {
                await using var context = factory.CreateDbContext();
                var exists = await context.Resources.AnyAsync(x => x.Name == name, token);
                return !exists;
                
            }).WithMessage("Resource with such name already exists");
    }
}