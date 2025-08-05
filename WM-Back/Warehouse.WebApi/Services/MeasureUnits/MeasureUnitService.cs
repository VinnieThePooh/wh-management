using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Responses;

namespace Warehouse.WebApi.Services.MeasureUnits;

public class MeasureUnitService(IDbContextFactory<WarehouseContext> contextFactory) : IMeasureUnitService
{
    public async Task<PaginationModel<MeasureUnitListItem>> GetWorking(int? pageNumber, int? pageSize)
    {
        var pnumber = pageNumber ?? Defaults.PAGE_NUMBER;
        var psize = pageSize ?? Defaults.PAGE_SIZE;

        await using var context = await contextFactory.CreateDbContextAsync();
        var source = context.MeasureUnits
            .AsNoTracking()
            .Where(x => !x.IsArchived);
        
        //todo: two requests per operation??
        var total = await source.CountAsync();
        if (total == 0)
            return PaginationModel<MeasureUnitListItem>.Empty(pnumber, psize);
        
        var result = await 
            source
                .OrderByDescending(x => x.Id)
                .Skip((pnumber-1) * psize).Take(psize)
                .Select(x => x.ToListItem())
                .ToArrayAsync();
        return new PaginationModel<MeasureUnitListItem>
        {
            PageNumber = pnumber,
            PageSize = psize,
            PageCount = PaginationModel<ResourceListItem>.GetPageCount(psize, total),
            PageData = result,
            TotalCount = total
        };
    }
    
    public async Task<PaginationModel<MeasureUnitListItem>> GetArchived(int? pageNumber, int? pageSize)
    {
        var pnumber = pageNumber ?? Defaults.PAGE_NUMBER;
        var psize = pageSize ?? Defaults.PAGE_SIZE;

        await using var context = await contextFactory.CreateDbContextAsync();
        var source = context.MeasureUnits
            .AsNoTracking()
            .Where(x => x.IsArchived);
        
        //todo: two requests per operation??
        var total = await source.CountAsync();
        if (total == 0)
            return PaginationModel<MeasureUnitListItem>.Empty(pnumber, psize);
        
        var result = await 
            source
                .OrderByDescending(x => x.Id)
                .Skip((pnumber-1) * psize).Take(psize)
                .Select(x => x.ToListItem())
                .ToArrayAsync();
        return new PaginationModel<MeasureUnitListItem>
        {
            PageNumber = pnumber,
            PageSize = psize,
            PageCount = PaginationModel<ResourceListItem>.GetPageCount(psize, total),
            PageData = result,
            TotalCount = total
        };
    }

    public async Task<int> CreateMeasureUnit(CreateMeasureUnitRequest createRequest)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var entity = new MeasureUnitEntity { Name = createRequest.Name, IsArchived = createRequest.Archived };
        context.Add(entity);
        await context.SaveChangesAsync();
        return entity.Id;
    }
    
    public async Task<int> DeleteMeasureUnit(int unitId)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var deleted = await context.MeasureUnits.Where(x => x.Id == unitId).ExecuteDeleteAsync();
        return deleted;
    }

    public async Task<int> EditMeasureUnit(EditMeasureUnitRequest request)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = await context.MeasureUnits.Where(x => x.Id == request.Id)
            .ExecuteUpdateAsync(x => x.SetProperty(x => x.Name, request.Name));
        return result;
    }
}