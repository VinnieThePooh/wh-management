using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Resources;
using Warehouse.WebApi.Models.Responses;
using IResourceService = Warehouse.WebApi.Services.IResourceService;

namespace WarehouseManagement.WebApi;

[Route("api/[controller]")]
[ApiController]
public class ResourcesController(IResourceService resourcesService) : ControllerBase
{
    [HttpGet("working")]
    public async Task<PaginationModel<ResourceListItem>> GetWorking(int? pageNumber, int? pageSize)
    {
        Console.WriteLine($"Got working data: ({pageNumber}, {pageSize})");
        var model = await resourcesService.GetWorking(pageNumber, pageSize);
        return model;
    }
    
    [HttpGet("archived")]
    public async Task<PaginationModel<ResourceListItem>> GetArchived(int? pageNumber, int? pageSize)
    {
        Console.WriteLine($"Got archived data: ({pageNumber}, {pageSize})");
        var model = await resourcesService.GetArchived(pageNumber, pageSize);
        return model;
    }

    [HttpPost]
    public async Task<ActionResult> CreateResource([FromServices] AbstractValidator<CreateResourceRequest> validator, CreateResourceRequest request)
    {
        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return BadRequest(result.Errors);

        var key = await resourcesService.CreateResource(request);
        return CreatedAtAction(nameof(GetResource), new { id = key }, new CreateResponse(key));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetResource([FromServices] IDbContextFactory<WarehouseContext> contextFactory, int id)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = await context.Resources.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (result is null)
            return NotFound($"Entity with id {id} was not found");
        
        return Ok(result.ToListItem());
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteResource(int id)
    {
        await resourcesService.DeleteResource(id);
        return NoContent();
    }

    [HttpGet("is-resource-taken/{name}")]
    public async Task<bool> IsResourceTaken([FromServices] IDbContextFactory<WarehouseContext> contextFactory, string name, int? id)
    {
        Console.WriteLine($"Got (id, name) for check: ({(id.HasValue ? id.ToString() : "NULL")}, {name})");
        await using var context = await contextFactory.CreateDbContextAsync();
        
        ResourceEntity? result;
        if (id == null)
            result = await context.Resources.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name);
        else 
            result = await context.Resources.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name && id != x.Id);
        return result != null;
    }
    
    [HttpPut]
    public async Task<ActionResult> EditResource([FromServices] AbstractValidator<EditResourceRequest> validator, EditResourceRequest request)
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);
        
        var result = await resourcesService.EditResource(request);
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
        var result = 
            await context.Resources.Where(x => x.Id == id)
            .ExecuteUpdateAsync(x => x.SetProperty(x => x.IsArchived, request.State));
        
        if (result == 0)
            return NotFound($"Entity with id {id} was not found");
        
        return NoContent();
    }
}