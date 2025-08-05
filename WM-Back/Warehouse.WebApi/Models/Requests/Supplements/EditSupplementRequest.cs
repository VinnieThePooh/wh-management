namespace Warehouse.WebApi.Models.Resources.Supplements;

public class EditSupplementRequest
{
    public int? DocumentId { get; set; }
    
    public string? DocumentNumber { get; set; }

    public DateTime? SupplyDate { get; set; }

    public ResourceSupplementUpdate[]? Resources { get; set; }
}