namespace Warehouse.WebApi.Models.Supplements;

public class SupplementListItem
{
    public int DocumentId { get; set; }
    
    public string DocumentNumber { get; set; }

    public DateTime SupplyDate { get; set; }
    
    public ResourceChangeListItem[] Resources { get; set; }
}