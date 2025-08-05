using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Common;
using Warehouse.WebApi.Models.Resources.Withdrawals;
using Warehouse.WebApi.Models.Witdrawals;

namespace Warehouse.WebApi.Services.Withdrawals;

public class WithdrawalService(IDbContextFactory<WarehouseContext> contextFactory) : IWithdrawalService
{
    public async Task<PaginationModel<WithdrawListItem>> GetWithdrawals(int? pageNumber, int? pageSize,
        WithdrawalFilter? filter)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        IQueryable<WithdrawalDocument> source = context.WithdrawalDocuments;

        if (filter is not null)
        {
            if (filter.DateBegin is not null)
                source = source.Where(x => x.WithdrawalDate >= filter.DateBegin);

            if (filter.DateEnd is not null)
            {
                // для простоты считаем что timezone клиента и сервера совпадают
                // иначе клиенту придется слать еще и свой часовой пояс для захвата суток
                var end = filter.DateEnd.Value.ToLocalTime().CaptureWholeLocalDay();
                source = source.Where(x => x.WithdrawalDate <= end);
            }

            if (filter.DocumentIds is { Length: > 0 })
                source = source.Where(x => filter.DocumentIds!.Contains(x.Id));

            if (filter.ResourceIds is { Length: > 0 })
                source = source.Where(x => x.Resources.Any(r => filter.ResourceIds!.Contains(r.ResourceId)));

            if (filter.MeasureUnitIds is { Length: > 0 })
                source = source.Where(x => x.Resources.Any(r => filter.MeasureUnitIds!.Contains(r.MeasureUnitId)));

            if (filter.CustomerIds is { Length: > 0 })
                source = source.Where(x => filter.CustomerIds!.Contains(x.CustomerId));
        }

        return await GetPaginationModel(source, pageNumber ?? Defaults.PAGE_NUMBER, pageSize ?? Defaults.PAGE_SIZE);
    }

    public Task<int> CreateWithdrawal(CreateWithdrawalRequest request)
    {
        throw new NotImplementedException();
    }

    public Task<OperationResult> UpdateWithdrawal(UpdateWithdrawalRequest request)
    {
        throw new NotImplementedException();
    }

    public Task<OperationResult> DeleteWithdrawal(int id)
    {
        throw new NotImplementedException();
    }


    async Task<PaginationModel<WithdrawListItem>> GetPaginationModel(IQueryable<WithdrawalDocument> documents,
        int pageNumber, int pageSize)
    {
        var count = await documents.CountAsync();
        if (count == 0)
            return PaginationModel<WithdrawListItem>.Empty(pageNumber, pageSize);

        var data = await documents
            .OrderByDescending(x => x.WithdrawalDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.ToListItem()).ToArrayAsync();

        return new PaginationModel<WithdrawListItem>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            PageCount = PaginationModel<WithdrawListItem>.GetPageCount(pageSize, count),
            PageData = data,
            TotalCount = count,
        };
    }
}