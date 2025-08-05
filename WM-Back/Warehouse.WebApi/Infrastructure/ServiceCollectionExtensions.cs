using FluentValidation;
using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Resources;
using Warehouse.WebApi.Models.Resources.Customers;
using Warehouse.WebApi.Models.Resources.Supplements;
using Warehouse.WebApi.Models.Resources.Withdrawals;
using Warehouse.WebApi.Services;
using Warehouse.WebApi.Services.Balances;
using Warehouse.WebApi.Services.Common;
using Warehouse.WebApi.Services.Customers;
using Warehouse.WebApi.Services.MeasureUnits;
using Warehouse.WebApi.Services.Resources;
using Warehouse.WebApi.Services.Supplements;
using Warehouse.WebApi.Services.Validators;
using Warehouse.WebApi.Services.Withdrawals;

namespace Warehouse.WebApi.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWarehouseServices(this IServiceCollection services)
    {
        services.AddSingleton<IViewModelStateService, ViewModelStateService>();
        services.AddSingleton<IResourceService, ResourceService>();
        services.AddSingleton<IMeasureUnitService, MeasureUnitService>();
        services.AddSingleton<ISupplyService, SupplyService>();
        services.AddSingleton<ICustomerService, CustomerService>();
        services.AddSingleton<IBalanceService, BalanceService>();
        services.AddSingleton<IWithdrawalService, WithdrawalService>();
        
        return services;
    }
    
    public static IServiceCollection AddWarehouseValidators(this IServiceCollection services)
    {
        services.AddScoped<AbstractValidator<CreateResourceRequest>, CreateResourceValidator>();
        services.AddScoped<AbstractValidator<EditResourceRequest>, EditResourceValidator>();
        
        services.AddScoped<AbstractValidator<CreateMeasureUnitRequest>, CreateUnitValidator>();
        services.AddScoped<AbstractValidator<EditMeasureUnitRequest>, EditUnitValidator>();
        
        services.AddScoped<AbstractValidator<CreateSupplementRequest>, CreateSupplementValidator>();
        services.AddScoped<AbstractValidator<EditSupplementRequest>, EditSupplementValidator>();
        
        services.AddScoped<AbstractValidator<CreateCustomerRequest>, CreateCustomerValidator>();
        services.AddScoped<AbstractValidator<EditCustomerRequest>, EditCustomerValidator>();
        
        services.AddScoped<AbstractValidator<CreateWithdrawalRequest>, CreateWithdrawalValidator>();
        services.AddScoped<AbstractValidator<UpdateWithdrawalRequest>, EditWithdrawalValidator>();
        
        return services;
    }
}