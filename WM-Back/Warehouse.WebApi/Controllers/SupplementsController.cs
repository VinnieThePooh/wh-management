using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Resources.Supplements;
using Warehouse.WebApi.Models.Supplements;
using Warehouse.WebApi.Services.Common;
using Warehouse.WebApi.Services.Supplements;

namespace MyApp.Namespace;

[Route("api/[controller]")]
[ApiController]
public class SupplementsController(ISupplyService supplyService) : ControllerBase
{
    [HttpPost]
    public async Task<PaginationModel<SupplementListItem>> GetSupplies(int? pageNumber, int? pageSize, SupplyFilter? filter)
    {
        Console.WriteLine($"Got working data: ({pageNumber}, {pageSize})");
        var model = await supplyService.GetSupplements(pageNumber, pageSize, filter);
        return model;
    }
        
    [HttpGet("{id}")]
    public async Task<ActionResult> GetSupplement([FromServices] IDbContextFactory<WarehouseContext> contextFactory, int id)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = await context.SupplyDocuments.Include(x => x.Resources).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (result is null)
            return NotFound($"Entity with id {id} was not found");
            
        return Ok(result.ToSupplementListItem());
    }
        
    [HttpPost("add")]
    public async Task<ActionResult> AddSupplement([FromServices] AbstractValidator<CreateSupplementRequest> validator, CreateSupplementRequest request)
    {
        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return BadRequest(result.Errors);
            
        var key = await supplyService.CreateSupplement(request);
        return CreatedAtAction(nameof(GetSupplement), new { id = key }, new CreateResponse(key));
    }
        
    [HttpPut]
    public async Task<ActionResult> UpdateSupplement([FromServices] AbstractValidator<EditSupplementRequest> validator, EditSupplementRequest request)
    {
        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return BadRequest(result.Errors);
            
        var updateResult = await supplyService.UpdateSupplement(request);
        if (updateResult.NotFound)
            return NotFound();
            
        if (!updateResult.Succeeded)
            return BadRequest(updateResult.ToFluentResult());
            
        return NoContent();
    }
        
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteSupplement(int id)
    {
        var result = await supplyService.DeleteSupplement(id);
        if (result.NotFound)
            return NotFound();
            
        // todo: create simpler result
        if (!result.Succeeded)
            return BadRequest(result.ToFluentResult());
            
        return NoContent();
    }
        
    [HttpGet("is-name-taken/{name}")]
    public async Task<bool> IsNameTaken([FromServices] IDbContextFactory<WarehouseContext> contextFactory,  string name, int? id)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        SupplyDocument? result;
            
        if (!id.HasValue) 
            result = await context.SupplyDocuments.AsNoTracking().FirstOrDefaultAsync(x => x.Number == name);
        else 
            result = await context.SupplyDocuments.AsNoTracking().FirstOrDefaultAsync(x => x.Number == name && x.Id != id);
        return result != null;
    }
        
    [HttpGet("filter-state")]
    public async Task<SupplementFilterState> GetFilterViewModelState([FromServices] IViewModelStateService stateService, int? docsLimit)
    {
        var model = await stateService.GetSupplementFilterState(docsLimit);
        return model;
    }
}