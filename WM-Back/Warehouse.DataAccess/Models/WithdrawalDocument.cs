namespace Warehouse.DataAccess.Models;

public class WithdrawalDocument : ChangeDocument
{
    public DateTime WithdrawalDate { get; set; }

    public bool Signed { get; set; }
    
    public List<ResourceWithdrawal> Resources { get; set; } = [];
    public int CustomerId { get; set; }
    public Customer Customer { get; set; }
}