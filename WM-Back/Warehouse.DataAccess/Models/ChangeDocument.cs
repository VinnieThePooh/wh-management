namespace Warehouse.DataAccess.Models;

public abstract class ChangeDocument : DbEntity<int>
{
    public string Number { get; set; }
}