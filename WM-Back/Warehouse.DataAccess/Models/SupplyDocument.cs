namespace Warehouse.DataAccess.Models;

public class SupplyDocument : ChangeDocument
{
    public DateTime SupplyDate { get; set; }

    public List<ResourceSupplement> Resources { get; set; } = [];
}