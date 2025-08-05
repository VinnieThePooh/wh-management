namespace Warehouse.WebApi.Models;

public class BalanceListItem
{
    public int BalanceId { get; set; }

    public int MeasureUnitId { get; set; }

    public int ResourceId { get; set; }

    public int Quantity { get; set; }
}

public class FullBalanceListItem
{
    public int BalanceId { get; set; }

    public int MeasureUnitId { get; set; }

    public int ResourceId { get; set; }
    
    public string ResourceName { get; set; }

    public string UnitName { get; set; }

    public int Quantity { get; set; }
}