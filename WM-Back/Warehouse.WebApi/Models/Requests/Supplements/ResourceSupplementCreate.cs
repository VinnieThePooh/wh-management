namespace Warehouse.WebApi.Models.Resources.Supplements;

public record ResourceSupplementCreate(int? ResourceId, int? MeasureUnitId, int? Quantity);