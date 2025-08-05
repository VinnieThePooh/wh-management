using Warehouse.WebApi.Models.Customers;
using Warehouse.WebApi.Models.Witdrawals;

namespace Warehouse.WebApi.Models.Responses;

public class WithdrawalFilterState(ResourceListItem[] resources, MeasureUnitListItem[] measureUnits, WithdrawSelectListItem[] documents, CustomerSelectListItem[] customers)
{
    public MeasureUnitListItem[] MeasureUnits { get; set; } = measureUnits;

    public ResourceListItem[] Resources { get; set; } = resources;
    
    public WithdrawSelectListItem[] Documents { get; set; } = documents;
    //todo: really?
    public CustomerSelectListItem[] Customers { get; set; } = customers;
}