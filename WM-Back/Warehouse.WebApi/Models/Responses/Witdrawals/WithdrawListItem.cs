using Warehouse.WebApi.Models.Common;

namespace Warehouse.WebApi.Models.Witdrawals;

public class WithdrawListItem
{
    public int DocumentId { get; set; }

    public string DocumentNumber { get; set; }

    public DateTime WithdrawalDate { get; set; }

    public int CustomerId { get; set; }

    public string CustomerName { get; set; }

    public bool Signed { get; set; }

    public ResourceChangeListItem[] Resources { get; set; }
}

public class WithdrawSelectListItem : IListItem
{
    public int Id { get; set; }
    public string Name { get; set; }
}