using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Resources;
using Warehouse.WebApi.Models.Responses;

namespace Warehouse.WebApi.Services;

public class ResourceService(IDbContextFactory<WarehouseContext> contextFactory) : IResourceService
{
    //todo: change ordering logic?
    public async Task<PaginationModel<ResourceListItem>> GetWorking(int? pageNumber, int? pageSize)
    {
        var pnumber = pageNumber ?? Defaults.PAGE_NUMBER;
        var psize = pageSize ?? Defaults.PAGE_SIZE;

        await using var context = await contextFactory.CreateDbContextAsync();
        var source = context.Resources
            .AsNoTracking()
            .Where(x => !x.IsArchived);
        
        //todo: two requests per operation??
        var total = await source.CountAsync();
        if (total == 0)
            return PaginationModel<ResourceListItem>.Empty(pnumber, psize);
        
        var result = await 
            source
            .OrderByDescending(x => x.Id)
            .Skip((pnumber-1) * psize).Take(psize)
            .Select(x => x.ToListItem())
            .ToArrayAsync();
        
        return new PaginationModel<ResourceListItem>
        {
            PageNumber = pnumber,
            PageSize = psize,
            PageCount = PaginationModel<ResourceListItem>.GetPageCount(psize, total),
            PageData = result,
            TotalCount = total
        };
    }

    public async Task<PaginationModel<ResourceListItem>> GetArchived(int? pageNumber, int? pageSize)
    {
        var pnumber = pageNumber ?? Defaults.PAGE_NUMBER;
        var psize = pageSize ?? Defaults.PAGE_SIZE;

        await using var context = await contextFactory.CreateDbContextAsync();
        var source = context.Resources
            .AsNoTracking()
            .Where(x => x.IsArchived);
        
        //todo: two requests per operation??
        var total = await source.CountAsync();
        if (total == 0)
            return PaginationModel<ResourceListItem>.Empty(pnumber, psize);
        
        var result = await 
            source
                .OrderByDescending(x => x.Id)
                .Skip((pnumber-1) * psize).Take(psize)
                .Select(x => x.ToListItem())
                .ToArrayAsync();
        
        return new PaginationModel<ResourceListItem>
        {
            PageNumber = pnumber,
            PageSize = psize,
            PageCount = PaginationModel<ResourceListItem>.GetPageCount(psize, total),
            PageData = result,
            TotalCount = total
        };
    }

    public async Task<int> CreateResource(CreateResourceRequest createRequest)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var entity = new ResourceEntity { Name = createRequest.Name, IsArchived = createRequest.Archived };
        context.Add(entity);
        await context.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<int> DeleteResource(int resourceId)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var deleted = await context.Resources.Where(x => x.Id == resourceId).ExecuteDeleteAsync();
        return deleted;
    }
    
    public async Task<int> EditResource(EditResourceRequest request)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = 
            await context.Resources.Where(x => x.Id == request.Id)
            .ExecuteUpdateAsync(x => x.SetProperty(e => e.Name, request.Name));
        
        return result;
    }
}