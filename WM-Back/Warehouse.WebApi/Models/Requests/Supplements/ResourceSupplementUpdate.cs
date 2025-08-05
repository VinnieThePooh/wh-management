namespace Warehouse.WebApi.Models.Resources.Supplements;

public record ResourceSupplementUpdate(int? SupplementId, int? ResourceId, int? MeasureUnitId, int? Quantity);