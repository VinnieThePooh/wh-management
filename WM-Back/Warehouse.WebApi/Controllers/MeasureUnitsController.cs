using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.MeasureUnits;
using Warehouse.WebApi.Models.Resources;
using Warehouse.WebApi.Services.MeasureUnits;

namespace WarehouseManagement.WebApi;

[Route("api/measure-units")]
[ApiController]
public class MeasureUnitsController(IMeasureUnitService unitsService) : ControllerBase
{
    [HttpGet("working")]
    public async Task<PaginationModel<MeasureUnitListItem>> GetWorking(int? pageNumber, int? pageSize)
    {
        Console.WriteLine($"Got working data: ({pageNumber}, {pageSize})");
        var model = await unitsService.GetWorking(pageNumber, pageSize);
        return model;
    }
    
    [HttpGet("archived")]
    public async Task<PaginationModel<MeasureUnitListItem>> GetArchived(int? pageNumber, int? pageSize)
    {
        Console.WriteLine($"Got archived data: ({pageNumber}, {pageSize})");
        var model = await unitsService.GetArchived(pageNumber, pageSize);
        return model;
    }

    [HttpPost]
    public async Task<ActionResult> CreateMeasureUnit([FromServices] AbstractValidator<CreateMeasureUnitRequest> validator, CreateMeasureUnitRequest request)
    {
        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return BadRequest(result.Errors);

        var key = await unitsService.CreateMeasureUnit(request);
        return CreatedAtAction(nameof(GetMeasureUnit), new { id = key }, new CreateResponse(key));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetMeasureUnit([FromServices] IDbContextFactory<WarehouseContext> contextFactory, int id)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = await context.MeasureUnits.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (result is null)
            return NotFound($"Entity with id {id} was not found");
        
        return Ok(result.ToListItem());
    }
    
    //todo: add validation for non-deletion
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteMeasureUnit(int id)
    {
        await unitsService.DeleteMeasureUnit(id);
        return NoContent();
    }

    [HttpGet("is-unit-taken/{name}")]
    public async Task<bool> IsUnitTaken([FromServices] IDbContextFactory<WarehouseContext> contextFactory, string name, int? id)
    {
        Console.WriteLine($"Got (id, name) for check: ({(id.HasValue ? id.ToString() : "NULL")}, {name})");
        await using var context = await contextFactory.CreateDbContextAsync();
        
        MeasureUnitEntity? result;
        if (id == null)
            result = await context.MeasureUnits.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name);
        else 
            result = await context.MeasureUnits.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name && id != x.Id);
        return result != null;
    }
    
    [HttpPut]
    public async Task<ActionResult> EditUnit([FromServices] AbstractValidator<EditMeasureUnitRequest> validator, EditMeasureUnitRequest request)
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);
        
        var result = await unitsService.EditMeasureUnit(request);
        if (result == 0)
            return NotFound($"Entity with id {request.Id} was not found");
        
        return NoContent();
    }
    
    [HttpPut("set-archived-state/{id:int}" )]
    public async Task<ActionResult> SetArchivedState([FromServices] IDbContextFactory<WarehouseContext> contextFactory, int id, SetArchiveRequest request)
    {
        Console.WriteLine($"Arrived state:bool parameter: {request.State}");
        
        // no encapsulation in service - too simple
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = await context.MeasureUnits.Where(x => x.Id == id)
                .ExecuteUpdateAsync(x => x.SetProperty(x => x.IsArchived, request.State));
        
        if (result == 0)
            return NotFound($"Entity with id {id} was not found");
        
        return NoContent();
    }
}