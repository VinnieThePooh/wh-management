namespace Warehouse.WebApi.Models.Resources.Withdrawals;

public class UpdateWithdrawalRequest
{
    public int? DocumentId { get; set; }
    public string Number { get; set; }

    public DateTime? WithdrawalDate { get; set; }

    public int? CustomerId { get; set; }

    public ResourceChangeListItem[]? Resources { get; set; }
}