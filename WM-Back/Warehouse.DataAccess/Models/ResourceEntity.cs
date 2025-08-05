namespace Warehouse.DataAccess.Models;

public class ResourceEntity : DbEntity<int>, IArchivableEntity
{
    public bool IsArchived { get; set; }
    public string Name { get; set; }

    public string? Description { get; set; }
}