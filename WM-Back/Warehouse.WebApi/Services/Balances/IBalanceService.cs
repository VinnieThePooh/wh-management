using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;

namespace Warehouse.WebApi.Services.Balances;

public interface IBalanceService
{
    Task<PaginationModel<BalanceListItem>> GetBalances(int? pageNumber, int? pageSize, BalanceFilter? filter);
}