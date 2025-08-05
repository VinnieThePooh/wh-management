namespace Warehouse.WebApi.Models;

// EntityId - PK for matching entity
public record struct ResourceChangeListItem(int EntityId, int ResourceId, string ResourceName, int MeasureUnitId, string MeasureUnit, int Quantity);