using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Services.Resources;

namespace Warehouse.WebApi.Infrastructure;

public static class DbContextExtensions
{
    public static async Task<FullSupplyDocument?> FullSupplyDocumentById(this WarehouseContext context, int documentId)
    {
        return await context.SupplyDocuments
            .Include(x => x.Resources)
            .ThenInclude(x => x.MeasureUnit)
            .Include(x => x.Resources)
            .ThenInclude(x => x.Resource)
            .Where(x => x.Id == documentId)
            .Select(x => x.ToFullDocument()).FirstOrDefaultAsync();
    }

    public static async Task<SupplyDocument?> SupplyDocumentById(this WarehouseContext context, int id)
    {
        return await context.SupplyDocuments
            .Include(x => x.Resources)
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync();
    }
}