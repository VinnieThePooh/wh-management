namespace Warehouse.WebApi.Infrastructure;

public class WithdrawalFilter
{
    public DateTime? DateBegin { get; set; }
    public DateTime? DateEnd { get; set; }

    public int[]? CustomerIds { get; set; }
    public int[]? DocumentIds { get; set; }

    public int[]? ResourceIds { get; set; }
    public int[]? MeasureUnitIds { get; set; }
}