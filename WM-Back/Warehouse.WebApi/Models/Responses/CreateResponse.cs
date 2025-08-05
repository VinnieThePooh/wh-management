namespace Warehouse.WebApi.Models;

public struct CreateResponse(int id)
{
    public int? Id { get; set; } = id;
}