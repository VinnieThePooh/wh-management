using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Common;
using Warehouse.WebApi.Models.Resources.Supplements;
using Warehouse.WebApi.Models.Supplements;
using Warehouse.WebApi.Services.Resources;

namespace Warehouse.WebApi.Services.Supplements;

public class SupplyService(IDbContextFactory<WarehouseContext> contextFactory) : ISupplyService
{
    public async
        Task<PaginationModel<SupplementListItem>> GetSupplements(int? pageNumber, int? pageSize, SupplyFilter? filter)
    {
        pageNumber ??= Defaults.PAGE_NUMBER;
        pageSize ??= Defaults.PAGE_SIZE;

        await using var context = await contextFactory.CreateDbContextAsync();
        IQueryable<SupplyDocument> source = context.SupplyDocuments;

        if (filter is not null)
        {
            if (filter.DateBegin is not null)
            {
                source = source.Where(x => x.SupplyDate >= filter.DateBegin);
            }

            if (filter.DateEnd is not null)
            {
                // для простоты считаем что timezone клиента и сервера совпадают
                // иначе клиенту придется слать еще и свой часовой пояс для захвата суток
                var end = filter.DateEnd.Value.ToLocalTime().CaptureWholeLocalDay();
                source = source.Where(x => x.SupplyDate <= end);
            }

            if (filter.DocumentIds is { Length: > 0 })
                source = source.Where(x => filter.DocumentIds!.Contains(x.Id));

            if (filter.ResourceIds is { Length: > 0 })
                source = source.Where(x => x.Resources.Any(r => filter.ResourceIds!.Contains(r.ResourceId)));

            if (filter.MeasureUnitIds is { Length: > 0 })
                source = source.Where(x => x.Resources.Any(r => filter.MeasureUnitIds!.Contains(r.MeasureUnitId)));
        }

        var count = await source.CountAsync();
        if (count == 0)
            return PaginationModel<SupplementListItem>.Empty(pageNumber.Value, pageSize.Value);

        var data = await source
            .OrderByDescending(x => x.SupplyDate)
            .Skip((pageNumber.Value - 1) * pageSize.Value)
            .Take(pageSize.Value)
            .Select(x => new SupplementListItem
            {
                DocumentId = x.Id,
                DocumentNumber = x.Number,
                SupplyDate = x.SupplyDate,
                Resources = x.Resources.Select(rs =>
                    new ResourceChangeListItem(rs.Id, rs.ResourceId, rs.Resource.Name, rs.MeasureUnitId,
                        rs.MeasureUnit.Name,
                        rs.Quantity)
                ).ToArray()
            }).ToArrayAsync();

        return new PaginationModel<SupplementListItem>
        {
            PageNumber = pageNumber.Value,
            PageSize = pageSize.Value,
            PageCount = PaginationModel<SupplementListItem>.GetPageCount(pageSize.Value, count),
            PageData = data,
            TotalCount = count,
        };
    }

    //todo: just without supplements itself, only documents
    public async Task<int> CreateSupplement(CreateSupplementRequest request)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        //todo: the whole one-to-many as a graph doesn't get inserted
        var doc = new SupplyDocument
        {
            SupplyDate = request.SupplyDate!.Value,
            Number = request.DocumentNumber!,
        };
        context.SupplyDocuments.Add(doc);
        await context.SaveChangesAsync();

        context.Set<ResourceSupplement>().AddRange(
            request.Resources!.Select(x => new ResourceSupplement
            {
                MeasureUnitId = x.MeasureUnitId!.Value,
                ResourceId = x.ResourceId!.Value,
                DocumentId = doc.Id,
                Quantity = x.Quantity!.Value
            }));

        //todo: may be not optimized
        foreach (var res in request.Resources!)
        {
            var (balance, _) = await EnsureBalanceExists(context, res.ResourceId!.Value, res.MeasureUnitId!.Value);
            balance.Quantity += res.Quantity!.Value;
        }

        await context.SaveChangesAsync();
        return doc.Id;
    }

    private async Task<(ResourceBalance, bool newObject)> EnsureBalanceExists(WarehouseContext context, int resourceId, int measureUnitId)
    {
        var set = context.Set<ResourceBalance>();
        var balance = await set
            .FirstOrDefaultAsync(x => x.ResourceId == resourceId && x.MeasureUnitId == measureUnitId);

        if (balance is not null)
            return (balance, false);
        
        balance = new ResourceBalance
        {
            ResourceId = resourceId,
            MeasureUnitId = measureUnitId,
            Quantity = 0
        };
        set.Add(balance);
        await context.SaveChangesAsync();
        return  (balance, true);
    }

    public async Task<OperationResult> UpdateSupplement(EditSupplementRequest request)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        // todo: extension?
        var document = await context.FullSupplyDocumentById(request.DocumentId!.Value);
        if (document is null)
            return new OperationResult { NotFound = true };

        var updateResult = await TryUpdateSupplement(context, request, document);
        return updateResult;
    }

    public async Task<OperationResult> DeleteSupplement(int id)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var document = await context.FullSupplyDocumentById(id);
        if  (document is null)
            return  new OperationResult { NotFound = true };
        
        OperationResult result = new();
        var deleteChanges = new List<ResourceSupplement>();
        
        foreach (var resource in document.Resources)
        {
            //todo: balance temporal cache
            var (balance, _) = await EnsureBalanceExists(context, resource.ResourceId, resource.MeasureUnitId!);
            var delta = balance.Quantity - resource.Quantity;
            if (delta < 0)
            {
                result.AddError($"INSUFF_RES_{resource.SupplementId}",
                    $"На складе недостаточно ресурса {resource.ResourceName} в виде '{resource.UnitName}' (нехватка {Math.Abs(delta)} {resource.UnitName}).");
            }
            else
            {
                balance.Quantity = delta;
                deleteChanges.Add(new ResourceSupplement() {Id = resource.SupplementId});
            }
        }

        if (!result.HasErrors)
        {
            var doc = context.SupplyDocuments.Local.FindEntry(id)!;
            doc.State = EntityState.Deleted;
            context.RemoveRange(deleteChanges);
            await context.SaveChangesAsync();
        }
        return result;
    }

    private async Task<OperationResult> TryUpdateSupplement(WarehouseContext context,
        EditSupplementRequest request,
        FullSupplyDocument fullDocument)
    {
        var supplementUpdates = request.Resources ?? [];
        var result = new OperationResult();
        var changesToRemove = new List<int>();
        var changesToAdd = new List<ResourceSupplement>();

        //1. Update существующих (без учета смена единицы измерения)
        foreach (var resource in supplementUpdates)
        {
            // 1. to add
            if (!resource.SupplementId.HasValue)
            {
               changesToAdd.Add(new ResourceSupplement
               {
                   ResourceId = resource.ResourceId!.Value,
                   DocumentId = request.DocumentId!.Value,
                   MeasureUnitId = resource.MeasureUnitId!.Value,
                   Quantity = resource.Quantity!.Value,
               });
            }
            else
            {
                // 2. update
                //todo: changing resourceId and measureUnitId is not supported yet
                var (balance, _) = await EnsureBalanceExists(context, resource.ResourceId!.Value, resource.MeasureUnitId!.Value);
                // todo: add dictionary for quick mapping id to names
                // NOTE: we don't check for integrity (assuming data is manipulated only via our SPA) - Resource might not exist for some reason
                var dbResource = fullDocument.Resources.First(x => x.SupplementId == resource.SupplementId);
                
                var delta = resource.Quantity!.Value - dbResource.Quantity;   
                switch (delta)
                {
                    case 0:
                        continue;
                    case > 0:
                        balance.Quantity += delta;
                        break;
                    case < 0 when balance.Quantity < Math.Abs(delta):
                        result.AddError($"INSUFF_RES_{dbResource.SupplementId}",
                            $"На складе недостаточно ресурса {dbResource.ResourceName} в виде '{dbResource.UnitName}' (нехватка {Math.Abs(delta)} {dbResource.UnitName}).");
                        continue;
                    default:
                        balance.Quantity -= Math.Abs(delta);
                        break;
                }

                // it is there cause of we have just built FullSupplyDocument
                var trackedResource = context.Set<ResourceSupplement>().Local.FindEntry(dbResource.SupplementId)!;
                trackedResource.Entity.Quantity = resource.Quantity!.Value;
                trackedResource.State = EntityState.Modified;
                context.Entry(balance).State = EntityState.Modified;
            }
        }
        
        // 3. Persisting удаленных
        var knownIds = supplementUpdates.Where(x => x.SupplementId is not null).Select(x => x.SupplementId).ToArray();
        foreach (var frs in fullDocument.Resources.Where(x => !knownIds.Contains(x.SupplementId)))
        {
            //todo: temp cache for balance objects
            //todo: wrap balance check in separate method
            var (balance, _) = await EnsureBalanceExists(context, frs.ResourceId, frs.MeasureUnitId);
            var delta = balance.Quantity - frs.Quantity;
            if (delta < 0)
            {
                result.AddError($"INSUFF_RES_{frs.SupplementId}",
                    $"[Удаление поставки]: На складе недостаточно ресурса {frs.ResourceName} в виде '{frs.UnitName}' (нехватка {Math.Abs(delta)} {frs.UnitName}).");
            }
            else
            {
                balance.Quantity = delta;
                changesToRemove.Add(frs.SupplementId);
            }
        }
        
        // 4. Создание, если требуется ResourceBalance для новых ResourceSupplement
        foreach (var supplement in changesToAdd)
        {
            var (balance, _) = await EnsureBalanceExists(context, supplement.ResourceId,  supplement.MeasureUnitId);
            balance.Quantity += supplement.Quantity;
        }
        
        if (!result.HasErrors)
        {
            var set = context.Set<ResourceSupplement>();
            set.RemoveRange(set.Local.Where(x => changesToRemove.Contains(x.Id)));
            context.AddRange(changesToAdd);
            await context.SaveChangesAsync();
        }

        return result;
    }
    
}