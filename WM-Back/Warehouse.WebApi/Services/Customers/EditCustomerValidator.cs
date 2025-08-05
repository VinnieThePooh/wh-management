using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Models.Resources.Customers;

namespace Warehouse.WebApi.Services.Customers;

public class EditCustomerValidator : AbstractValidator<EditCustomerRequest>
{
    public EditCustomerValidator(IDbContextFactory<WarehouseContext> factory)
    {
        RuleFor(x => x.Id)
            .NotNull().WithMessage("Id should not be null")
            .NotEqual(0).WithMessage("Id cannot be 0");
        
        RuleFor(x => x.Name)
            .NotNull().WithMessage("Customer name should not be null")
            .NotEmpty().WithMessage("Customer name should not be empty")
            .MustAsync(async (entity, name, token) =>
            {
                await using var context = factory.CreateDbContext();
                var exists = await context.Customers.AnyAsync(x => x.Name == name && x.Id != entity.Id, token);
                return !exists;
                
            }).WithMessage("Customer with such name already exists");
        
        RuleFor(x => x.Address)
            .MaximumLength(400).WithMessage("Customer address should not exceed 400 characters");
    }
}