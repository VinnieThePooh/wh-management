namespace Warehouse.WebApi.Models.Resources.Supplements;

public class CreateSupplementRequest
{
    public string? DocumentNumber { get; set; }

    public DateTime? SupplyDate { get; set; }

    public ResourceSupplementCreate[]? Resources { get; set; }
}