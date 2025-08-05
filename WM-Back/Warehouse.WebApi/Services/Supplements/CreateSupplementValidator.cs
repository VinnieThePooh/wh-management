using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Models.Resources.Supplements;

namespace Warehouse.WebApi.Services.Supplements;

public class CreateSupplementValidator : AbstractValidator<CreateSupplementRequest>
{
    public CreateSupplementValidator(IDbContextFactory<WarehouseContext> factory)
    {
        RuleFor(x => x.DocumentNumber).NotNull().WithMessage("Document number is required.")
            .MustAsync(async (number, token) =>
            {
                await using var context = factory.CreateDbContext();
                var exists = await context.SupplyDocuments.AnyAsync(x => x.Number == number, token);
                return !exists;
            }).WithMessage("Document with such name already exists");
        RuleFor(x => x.SupplyDate).NotNull().WithMessage("Supply date is required.");
        RuleForEach(x => x.Resources).SetValidator(new ResourceSupplementCreateValidator());
    }
}