using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Common;
using Warehouse.WebApi.Models.Resources.Withdrawals;
using Warehouse.WebApi.Models.Witdrawals;

namespace Warehouse.WebApi.Services.Withdrawals;

public interface IWithdrawalService
{
    Task<PaginationModel<WithdrawListItem>> GetWithdrawals(int? pageNumber, int? pageSize, WithdrawalFilter? filter);
    
    Task<int> CreateWithdrawal(CreateWithdrawalRequest request);
    
    Task<OperationResult> UpdateWithdrawal(UpdateWithdrawalRequest request);
    
    Task<OperationResult> DeleteWithdrawal(int id);
}