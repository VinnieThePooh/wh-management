namespace Warehouse.DataAccess.Models;

/// <summary>
/// TPC base type
/// </summary>
public abstract class ResourceChange : DbEntity<int>
{
    public int ResourceId { get; set; }

    public int MeasureUnitId { get; set; }

    public int Quantity { get; set; }

    public int DocumentId { get; set; }
    
    public MeasureUnitEntity MeasureUnit { get; set; }
    
    public ResourceEntity Resource { get; set; }
}