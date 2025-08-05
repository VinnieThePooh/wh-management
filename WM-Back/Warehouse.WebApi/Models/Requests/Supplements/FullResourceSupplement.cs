namespace Warehouse.WebApi.Models.Requests.Supplements;

public class FullResourceSupplement
{
    public int SupplementId { get; set; }
    
    public int ResourceId { get; set; }

    public int MeasureUnitId { get; set; }

    public int Quantity { get; set; }

    public string UnitName { get; set; }

    public string ResourceName { get; set; }
}