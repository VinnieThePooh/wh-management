using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Customers;
using Warehouse.WebApi.Models.Resources;
using Warehouse.WebApi.Models.Resources.Customers;
using Warehouse.WebApi.Services.Customers;

namespace WarehouseManagement.WebApi;

[Route("api/[controller]")]
[ApiController]
public class CustomersController(ICustomerService customerService) : ControllerBase
{
    [HttpGet("working")]
    public async Task<PaginationModel<CustomerListItem>> GetWorking(int? pageNumber, int? pageSize)
    {
        Console.WriteLine($"Got working data: ({pageNumber}, {pageSize})");
        var model = await customerService.GetWorking(pageNumber, pageSize);
        return model;
    }
    
    [HttpGet("archived")]
    public async Task<PaginationModel<CustomerListItem>> GetArchived(int? pageNumber, int? pageSize)
    {
        Console.WriteLine($"Got archived data: ({pageNumber}, {pageSize})");
        var model = await customerService.GetArchived(pageNumber, pageSize);
        return model;
    }

    [HttpPost]
    public async Task<ActionResult> CreateCustomer([FromServices] AbstractValidator<CreateCustomerRequest> validator, CreateCustomerRequest request)
    {
        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return BadRequest(result.Errors);

        var key = await customerService.CreateCustomer(request);
        return CreatedAtAction(nameof(GetCustomer), new { id = key }, new CreateResponse(key));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetCustomer([FromServices] IDbContextFactory<WarehouseContext> contextFactory, int id)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = await context.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (result is null)
            return NotFound($"Entity with id {id} was not found");
        
        return Ok(result.ToListItem());
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCustomer(int id)
    {
        var result = await customerService.DeleteCustomer(id);
        if (result.NotFound)
            return NotFound();
            
        return NoContent();
    }

    [HttpGet("is-name-taken/{name}")]
    public async Task<bool> IsNameTaken([FromServices] IDbContextFactory<WarehouseContext> contextFactory, string name, int? id)
    {
        Console.WriteLine($"Got (id, name) for check: ({(id.HasValue ? id.ToString() : "NULL")}, {name})");
        await using var context = await contextFactory.CreateDbContextAsync();
        
        Customer? result;
        if (id == null)
            result = await context.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name);
        else 
            result = await context.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name && id != x.Id);
        return result != null;
    }
    
    [HttpPut]
    public async Task<ActionResult> EditCustomer([FromServices] AbstractValidator<EditCustomerRequest> validator, EditCustomerRequest request)
    {
        //todo: make errors flatten
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);
        
        var result = await customerService.EditCustomer(request);
        if (result.NotFound)
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
            await context.Customers.Where(x => x.Id == id)
            .ExecuteUpdateAsync(x => x.SetProperty(x => x.IsArchived, request.State));
        
        if (result == 0)
            return NotFound($"Entity with id {id} was not found");
        
        return NoContent();
    }
}