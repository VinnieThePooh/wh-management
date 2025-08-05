using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Resources;
using Warehouse.WebApi.Models.Responses;

namespace Warehouse.WebApi.Services;

public interface IResourceService
{
    public Task<PaginationModel<ResourceListItem>> GetWorking(int? pageNumber, int? pageSize);
    
    public Task<PaginationModel<ResourceListItem>> GetArchived(int? pageNumber, int? pageSize);
    
    public Task<int> CreateResource(CreateResourceRequest createRequest);
    
    public Task<int> DeleteResource(int resourceId);
    
    public Task<int> EditResource(EditResourceRequest request);
}