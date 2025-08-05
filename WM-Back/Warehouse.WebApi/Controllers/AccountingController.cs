using Microsoft.AspNetCore.Mvc;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Balances;
using Warehouse.WebApi.Services.Balances;
using Warehouse.WebApi.Services.Common;

namespace WarehouseManagement.WebApi;

[Route("api/[controller]")]
[ApiController]
public class AccountingController(IBalanceService balanceService) : ControllerBase
{
    [HttpGet("filter-state")]
    public async Task<BalancesFilterState> GetFilterViewModelState([FromServices] IViewModelStateService stateService)
    {
        var model = await stateService.GetBalancesFilterState();
        return model;
    }

    [HttpPost]
    public async Task<PaginationModel<BalanceListItem>> GetBalances(int? pageNumber, int? pageSize,
        BalanceFilter? filter)
    {
        var model = await balanceService.GetBalances(pageNumber, pageSize, filter);
        return model;
    }
}