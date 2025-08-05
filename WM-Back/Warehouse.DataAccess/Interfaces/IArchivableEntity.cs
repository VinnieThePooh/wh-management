namespace Warehouse.DataAccess.Models;

public interface IArchivableEntity
{
    bool IsArchived { get; set; }
}