using FluentValidation;
using Warehouse.WebApi.Models.Resources.Supplements;

namespace Warehouse.WebApi.Services.Supplements;

public class ResourceSupplementCreateValidator : AbstractValidator<ResourceSupplementCreate>
{
    public ResourceSupplementCreateValidator()
    {
        RuleFor(x => x.MeasureUnitId).NotNull().WithMessage("Measure unit id is required");
        RuleFor(x => x.ResourceId).NotNull().WithMessage("Resource id is required");
        RuleFor(x => x.Quantity)
            .NotNull().WithMessage("Measure unit id is required")
            .GreaterThan(0)
            .WithMessage("Resource quantity must be greater than 0.");
    }
}