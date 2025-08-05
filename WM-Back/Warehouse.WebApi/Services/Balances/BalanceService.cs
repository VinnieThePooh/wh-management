using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Supplements;

namespace Warehouse.WebApi.Services.Balances;

public class BalanceService(IDbContextFactory<WarehouseContext> factory) : IBalanceService
{
    public async Task<PaginationModel<BalanceListItem>> GetBalances(int? pageNumber, int? pageSize, BalanceFilter? filter)
    {
        await using var context = await factory.CreateDbContextAsync();

        IQueryable<ResourceBalance> source = context.ResourceBalances
            .Include(x => x.Resource)
            .Include(x => x.MeasureUnit);
        if (filter is not null)
        {
            switch (filter)
            {
                case { ResourceIds.Length: > 0, MeasureUnitIds.Length: > 0 }:
                    source = source.Where(b => filter.ResourceIds!.Contains(b.ResourceId) &&  filter.MeasureUnitIds!.Contains(b.MeasureUnitId));
                    break;
                case { ResourceIds.Length: > 0 }:
                    source = source.Where(b => filter.ResourceIds!.Contains(b.ResourceId));
                    break;
                default:
                    source = source.Where(b => filter.MeasureUnitIds!.Contains(b.MeasureUnitId));
                    break;
            }
        }

        return await GetPaginationModel(source, pageNumber ?? Defaults.PAGE_NUMBER, pageSize ?? Defaults.PAGE_SIZE);
    }

    private async Task<PaginationModel<BalanceListItem>> GetPaginationModel(IQueryable<ResourceBalance> source, int pageNumber, int pageSize)
    {
        var count = await source.CountAsync();
        if (count == 0)
            return PaginationModel<BalanceListItem>.Empty(pageNumber, pageSize);

        var data = await source
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new BalanceListItem
            {
                BalanceId = x.Id,
                MeasureUnitId = x.MeasureUnitId,
                ResourceId = x.ResourceId,
                Quantity = x.Quantity,
                // ResourceName = x.Resource.Name,
                // UnitName = x.MeasureUnit.Name
            }).ToArrayAsync();

        return new PaginationModel<BalanceListItem>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            PageCount = PaginationModel<BalanceListItem>.GetPageCount(pageSize, count),
            PageData = data,
            TotalCount = count,
        }; 
    }
}