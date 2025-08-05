using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Common;
using Warehouse.WebApi.Models.Customers;
using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Resources.Customers;
using Warehouse.WebApi.Services.Supplements;

namespace Warehouse.WebApi.Services.Customers;

public interface ICustomerService
{
    Task<PaginationModel<CustomerListItem>> GetWorking(int? pageNumber, int? pageSize);
    
    Task<PaginationModel<CustomerListItem>> GetArchived(int? pageNumber, int? pageSize);
    
    Task<int> CreateCustomer(CreateCustomerRequest createRequest);
    
    Task<OperationResult> DeleteCustomer(int customerId);
    
    Task<OperationResult> EditCustomer(EditCustomerRequest request);
}