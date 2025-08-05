using Warehouse.WebApi.Models.Common;

namespace Warehouse.WebApi.Models;

public class DocumentListItem : IListItem
{
    public int Id { get; set; }
    public string Name { get; set; }
}