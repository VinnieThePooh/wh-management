using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Common;
using Warehouse.WebApi.Models.Resources.Supplements;
using Warehouse.WebApi.Models.Supplements;

namespace Warehouse.WebApi.Services.Supplements;

public interface ISupplyService
{
    Task<PaginationModel<SupplementListItem>> GetSupplements(int? pageNumber, int? pageSize, SupplyFilter? filter);
    
    Task<int> CreateSupplement(CreateSupplementRequest request);
    
    Task<OperationResult> UpdateSupplement(EditSupplementRequest request);
    
    Task<OperationResult> DeleteSupplement(int id); 
}