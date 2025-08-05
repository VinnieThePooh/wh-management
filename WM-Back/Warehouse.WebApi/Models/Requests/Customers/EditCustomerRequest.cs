namespace Warehouse.WebApi.Models.Resources.Customers;

public class EditCustomerRequest
{
    public int? Id { get; set; }

    public string? Name { get; set; }

    public string? Address { get; set; }

    public bool IsArchived { get; set; }
}