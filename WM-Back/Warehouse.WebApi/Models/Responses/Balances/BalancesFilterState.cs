using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Responses;

namespace Warehouse.WebApi.Models.Balances;

public class BalancesFilterState(ResourceListItem[] resources, MeasureUnitListItem[] measureUnits)
{
    public MeasureUnitListItem[] MeasureUnits { get; set; } = measureUnits;

    public ResourceListItem[] Resources { get; set; } = resources;
}