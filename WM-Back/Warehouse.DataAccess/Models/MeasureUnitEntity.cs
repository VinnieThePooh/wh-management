using System.ComponentModel.DataAnnotations.Schema;

namespace Warehouse.DataAccess.Models;

public class MeasureUnitEntity : DbEntity<int>, IArchivableEntity
{
    public bool IsArchived { get; set; }
    public string Name { get; set; }

    public string? Description { get; set; }
}