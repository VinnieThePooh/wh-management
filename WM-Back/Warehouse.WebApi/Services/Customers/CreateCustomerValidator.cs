using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Models.Resources.Customers;

namespace Warehouse.WebApi.Services.Customers;

public class CreateCustomerValidator : AbstractValidator<CreateCustomerRequest>
{
    public CreateCustomerValidator(IDbContextFactory<WarehouseContext> factory)
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Customer name should not be empty")
            .MustAsync(async (name, token) =>
            {
                await using var context = factory.CreateDbContext();
                var exists = await context.Customers.AnyAsync(x => x.Name == name, token);
                return !exists;
                
            }).WithMessage("Customer with such name already exists");
        
        RuleFor(x => x.Address).MaximumLength(400).WithMessage("Customer address length should be less than 400 characters");
    }
}