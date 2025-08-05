using Warehouse.WebApi.Models.Balances;
using Warehouse.WebApi.Models.Responses;
using Warehouse.WebApi.Models.Supplements;

namespace Warehouse.WebApi.Services.Common;

public interface IViewModelStateService
{
      Task<SupplementFilterState> GetSupplementFilterState(int? documentsLimit);
      
      Task<BalancesFilterState> GetBalancesFilterState();
      
      Task<WithdrawalFilterState> GetWithdrawalFilterState(int? documentsLimit, int? customersLimit);
}