namespace Warehouse.DataAccess.Models;

public class ResourceBalance : DbEntity<int>
{
    public int ResourceId { get; set; }

    public int MeasureUnitId { get; set; }

    public int Quantity { get; set; }

    public ResourceEntity Resource { get; set; }

    public MeasureUnitEntity MeasureUnit { get; set; }
}