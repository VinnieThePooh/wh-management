using Warehouse.WebApi.Models.Requests.Supplements;

namespace Warehouse.WebApi.Services.Resources;

public class FullSupplyDocument
{
    public int DocumentId { get; set; }

    public string DocumentNumber { get; set; }

    public FullResourceSupplement[] Resources { get; set; } = [];
}