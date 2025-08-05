using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Common;
using Warehouse.WebApi.Models.Customers;
using Warehouse.WebApi.Models.Resources.Customers;
using Warehouse.WebApi.Models.Responses;

namespace Warehouse.WebApi.Services.Customers;

public class CustomerService(IDbContextFactory<WarehouseContext> contextFactory) : ICustomerService
{
    public async Task<PaginationModel<CustomerListItem>> GetWorking(int? pageNumber, int? pageSize)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var source = context.Customers
            .AsNoTracking()
            .Where(x => !x.IsArchived);

        return await GetPaginationModel(pageNumber ?? Defaults.PAGE_NUMBER, pageSize ?? Defaults.PAGE_SIZE, source);
    }

    public async Task<PaginationModel<CustomerListItem>> GetArchived(int? pageNumber, int? pageSize)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var source = context.Customers
            .AsNoTracking()
            .Where(x => x.IsArchived);

        return await GetPaginationModel(pageNumber ?? Defaults.PAGE_NUMBER, pageSize ?? Defaults.PAGE_SIZE, source);
    }

    private async Task<PaginationModel<CustomerListItem>> GetPaginationModel(int pageNumber, int pageSize,
        IQueryable<Customer> dataSource)
    {
        //todo: two requests per operation??
        var total = await dataSource.CountAsync();
        if (total == 0)
            return PaginationModel<CustomerListItem>.Empty(pageNumber, pageSize);

        var result = await
            dataSource
                .OrderByDescending(x => x.Id)
                .Skip((pageNumber - 1) * pageSize).Take(pageSize)
                .Select(x => x.ToListItem())
                .ToArrayAsync();

        return new PaginationModel<CustomerListItem>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            PageCount = PaginationModel<ResourceListItem>.GetPageCount(pageSize, total),
            PageData = result,
            TotalCount = total
        };
    }

    public async Task<int> CreateCustomer(CreateCustomerRequest createRequest)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var entity = new Customer { Name = createRequest.Name!, IsArchived = createRequest.IsArchived };
        context.Add(entity);
        await context.SaveChangesAsync();
        return entity.Id;
    }

    public async Task<OperationResult> DeleteCustomer(int customerId)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var deleted = await context.Customers.Where(x => x.Id == customerId).ExecuteDeleteAsync();
        
        var result = new OperationResult();
        if (deleted == 0)
            result.NotFound = true;

        return result;
    }

    public async Task<OperationResult> EditCustomer(EditCustomerRequest request)
    {
        // no encapsulation in service - too simple
        await using var context = await contextFactory.CreateDbContextAsync();
        var affected =
            await context.Customers.Where(x => x.Id == request.Id)
                .ExecuteUpdateAsync(x =>
                    x.SetProperty(x => x.Name, request.Name)
                        .SetProperty(x => x.Address, request.Address));

        var result = new OperationResult();
        if (affected == 0)
            result.NotFound = true;

        return result;
    }
}