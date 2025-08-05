namespace Warehouse.DataAccess.Models;

public class Customer : DbEntity<int>, IArchivableEntity
{
    public bool IsArchived { get; set; }

    public string Name { get; set; }

    public string Address { get; set; }

    public List<WithdrawalDocument> WithdrawalDocuments { get; set; } = [];
}