using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Responses;

namespace Warehouse.WebApi.Models.Supplements;

public class SupplementFilterState(ResourceListItem[] resources, MeasureUnitListItem[] measureUnits, DocumentListItem[] documents)
{
    public MeasureUnitListItem[] MeasureUnits { get; set; } = measureUnits;

    public ResourceListItem[] Resources { get; set; } = resources;
    
    public DocumentListItem[] Documents { get; set; } = documents;
}