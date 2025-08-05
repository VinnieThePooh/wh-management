namespace Warehouse.WebApi.Models;

/// <summary>
/// Response model
/// </summary>
/// <typeparam name="T"></typeparam>
public struct PaginationModel<T>
{
    //might be redundant but ok
    public int PageSize { get; set; }

    //might be redundant but ok
    public int PageNumber { get; set; }

    public T[] PageData { get; set; }

    public int PageCount { get; set; }

    public int TotalCount { get; set; }

    public static PaginationModel<T> Empty(int pageNumber, int pageSize) => new()
    {
        PageSize = pageSize,
        PageNumber = pageNumber,
        PageCount = 0,
        TotalCount = 0,
        PageData = [],
    };

    internal static int GetPageCount(int pageSize, int totalCount)
    {
        if (totalCount == 0)
            return 0;

        var number = totalCount / pageSize;
        if (totalCount %  pageSize == 0)
            return number;
        
        return number + 1;
    } 
}