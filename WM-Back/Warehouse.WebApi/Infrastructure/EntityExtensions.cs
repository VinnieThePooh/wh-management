using Microsoft.AspNetCore.Mvc.Rendering;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Customers;
using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Requests.Supplements;
using Warehouse.WebApi.Models.Responses;
using Warehouse.WebApi.Models.Supplements;
using Warehouse.WebApi.Models.Witdrawals;
using Warehouse.WebApi.Services.Resources;

namespace Warehouse.WebApi.Infrastructure;

public static class EntityExtensions
{
    public static ResourceListItem ToListItem(this ResourceEntity entity) =>
        new() { Id = entity.Id, Name = entity.Name };

    public static MeasureUnitListItem ToListItem(this MeasureUnitEntity entity) =>
        new() { Id = entity.Id, Name = entity.Name };

    public static DocumentListItem ToListItem(this SupplyDocument entity) =>
        new() { Id = entity.Id, Name = entity.Number };

    public static SupplementListItem ToSupplementListItem(this SupplyDocument entity) =>
        new()
        {
            DocumentId = entity.Id,
            DocumentNumber = entity.Number,
            SupplyDate = entity.SupplyDate,
            Resources = entity.Resources.Select(rs =>
                new ResourceChangeListItem(rs.Id, rs.ResourceId, rs.Resource.Name, rs.MeasureUnitId, rs.MeasureUnit.Name, rs.Quantity)
            ).ToArray()
        };

    public static FullSupplyDocument ToFullDocument(this SupplyDocument entity)
    {
        return new FullSupplyDocument
        {
            DocumentId = entity.Id,
            DocumentNumber = entity.Number,
            Resources = entity.Resources.Select(x => new FullResourceSupplement
            {
                SupplementId = x.Id,
                MeasureUnitId = x.MeasureUnitId,
                ResourceId = x.ResourceId,
                UnitName = x.MeasureUnit.Name,
                ResourceName = x.Resource.Name,
                Quantity = x.Quantity

            }).ToArray()
        };
    }

    public static CustomerListItem ToListItem(this Customer entity)
    {
        return new CustomerListItem
        {
            Id = entity.Id,
            Name = entity.Name,
            Address = entity.Address,
            IsArchived = entity.IsArchived,
        };
    }
    
    public static CustomerSelectListItem ToSelectListItem(this Customer entity)
    {
        return new CustomerSelectListItem
        {
            Id = entity.Id,
            Name = entity.Name,
        };
    }

    public static ResourceChangeListItem ToListItem(this ResourceWithdrawal withdrawal) =>
    new(withdrawal.Id, withdrawal.ResourceId, withdrawal.Resource.Name, withdrawal.MeasureUnitId, withdrawal.MeasureUnit.Name,  withdrawal.Quantity);
    
    public static WithdrawListItem ToListItem(this WithdrawalDocument document)
    {
        return new WithdrawListItem
        {
            DocumentId = document.Id,
            CustomerId = document.CustomerId,
            WithdrawalDate = document.WithdrawalDate,
            DocumentNumber = document.Number,
            Signed = document.Signed,
            Resources = document.Resources.Select(x => x.ToListItem()).ToArray()
        };
    }

    public static WithdrawSelectListItem ToSelectListItem(this WithdrawalDocument document) => new() { Id = document.Id, Name = document.Number };
}