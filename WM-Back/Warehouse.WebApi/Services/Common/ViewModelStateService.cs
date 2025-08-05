using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Balances;
using Warehouse.WebApi.Models.Responses;
using Warehouse.WebApi.Models.Supplements;

namespace Warehouse.WebApi.Services.Common;

//todo: simple key-value cache?
public class ViewModelStateService(IDbContextFactory<WarehouseContext> contextFactory) : IViewModelStateService
{
    public async Task<SupplementFilterState> GetSupplementFilterState(int? documentsLimit)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        
        //todo: EF Interceptors?
        var units = await context.MeasureUnits.AsNoTracking()
            .Where(x => !x.IsArchived)
            .OrderBy(x => x.Name)
            .Select(x => x.ToListItem())
            .ToArrayAsync();
        var resources = await context.Resources.AsNoTracking()
            .Where(x => !x.IsArchived)
            .OrderBy(x => x.Name)
            .Select(x => x.ToListItem()).ToArrayAsync();
        
        var documents = await context.SupplyDocuments
            .OrderByDescending(x => x.SupplyDate)
            .Take(documentsLimit ?? Defaults.DOCS_LIMIT)
            .Select(x => x.ToListItem()).ToArrayAsync();
        
        return new SupplementFilterState(resources, units, documents);
    }

    public async Task<BalancesFilterState> GetBalancesFilterState()
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        
        //todo: EF Interceptors?
        var units = await context.MeasureUnits.AsNoTracking().Where(x => !x.IsArchived).OrderBy(x => x.Name)
            .Select(x => x.ToListItem()).ToArrayAsync();
        var resources = await context.Resources.AsNoTracking().Where(x => !x.IsArchived).OrderBy(x => x.Name)
            .Select(x => x.ToListItem()).ToArrayAsync();
        
        return new BalancesFilterState(resources, units);
    }

    public async Task<WithdrawalFilterState> GetWithdrawalFilterState(int? documentsLimit, int? customersLimit)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        
        //todo: EF Interceptors?
        var units = await context.MeasureUnits.AsNoTracking().Where(x => !x.IsArchived).OrderBy(x => x.Name)
            .Select(x => x.ToListItem()).ToArrayAsync();
        var resources = await context.Resources.AsNoTracking().Where(x => !x.IsArchived).OrderBy(x => x.Name)
            .Select(x => x.ToListItem()).ToArrayAsync();
        
        var documents = await context.WithdrawalDocuments
            .OrderByDescending(x => x.WithdrawalDate)
            .Take(documentsLimit ?? Defaults.DOCS_LIMIT)
            .Select(x => x.ToSelectListItem()).ToArrayAsync();
        
        var customers = await context.Customers
            .Where(x => !x.IsArchived)
            .OrderByDescending(x => x.Id)
            .Take(documentsLimit ?? Defaults.CUSTOMERS_LIMIT)
            .Select(x => x.ToSelectListItem()).ToArrayAsync();
        
        return new WithdrawalFilterState(resources, units, documents, customers);
    }
}