using Warehouse.WebApi.Models.Common;

namespace Warehouse.WebApi.Models.Customers;

public class CustomerListItem : IListItem
{
    public int Id { get; set; }
    
    public string Name { get; set; }

    public bool IsArchived { get; set; }

    public string Address { get; set; }
}

public class CustomerSelectListItem : IListItem
{
    public int Id { get; set; }
    public string Name { get; set; }
}