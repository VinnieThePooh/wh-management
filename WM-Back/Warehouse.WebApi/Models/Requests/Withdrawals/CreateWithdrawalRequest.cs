namespace Warehouse.WebApi.Models.Resources.Withdrawals;

public class CreateWithdrawalRequest
{
    public string DocumentNumber { get; set; }

    public DateTime? WithdrawalDate { get; set; }

    public int? CustomerId { get; set; }

    public ResourceChangeListItemRequest[]? Resources { get; set; }
}

public record struct ResourceChangeListItemRequest(int EntityId, int ResourceId, int MeasureUnitId, int Quantity);