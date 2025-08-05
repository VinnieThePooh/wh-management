namespace Warehouse.WebApi.Models.Resources;

public class CreateResourceRequest
{
    public string Name { get; set; }

    public bool Archived { get; set; }
}