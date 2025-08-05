using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Resources;

namespace Warehouse.WebApi.Services.MeasureUnits;

public interface IMeasureUnitService
{
    public Task<PaginationModel<MeasureUnitListItem>> GetWorking(int? pageNumber, int? pageSize);
    
    public Task<PaginationModel<MeasureUnitListItem>> GetArchived(int? pageNumber, int? pageSize);
    
    public Task<int> CreateMeasureUnit(CreateMeasureUnitRequest createRequest);
    
    public Task<int> DeleteMeasureUnit(int unitId);
    
    public Task<int> EditMeasureUnit(EditMeasureUnitRequest request);
}