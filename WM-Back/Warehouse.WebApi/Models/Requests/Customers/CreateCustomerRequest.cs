namespace Warehouse.WebApi.Models.Resources.Customers;

public class CreateCustomerRequest
{
    public string? Name { get; set; }

    public string? Address { get; set; }

    public bool IsArchived { get; set; }
}