using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Warehouse.DataAccess;
using Warehouse.DataAccess.Models;
using Warehouse.WebApi.Infrastructure;
using Warehouse.WebApi.Models;
using Warehouse.WebApi.Models.Resources.Supplements;
using Warehouse.WebApi.Models.Resources.Withdrawals;
using Warehouse.WebApi.Models.Responses;
using Warehouse.WebApi.Models.Supplements;
using Warehouse.WebApi.Models.Witdrawals;
using Warehouse.WebApi.Services.Common;
using Warehouse.WebApi.Services.Withdrawals;

namespace MyApp.Namespace;

[Route("api/[controller]")]
[ApiController]
public class WithdrawalsController(IWithdrawalService service) : ControllerBase
{
    [HttpPost]
    public async Task<PaginationModel<WithdrawListItem>> GetWithdrawals(int? pageNumber, int? pageSize, WithdrawalFilter? filter)
    {
        var model = await service.GetWithdrawals(pageNumber, pageSize, filter);
        return model;
    }
        
    [HttpGet("{id}")]
    public async Task<ActionResult> GetWithdrawal([FromServices] IDbContextFactory<WarehouseContext> contextFactory, int id)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var result = await context.WithdrawalDocuments.Include(x => x.Resources).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (result is null)
            return NotFound($"Entity with id {id} was not found");
            
        return Ok(result.ToListItem());
    }
        
    [HttpPost("add")]
    public async Task<ActionResult> AddWithdrawal([FromServices] AbstractValidator<CreateWithdrawalRequest> validator, CreateWithdrawalRequest request)
    {
        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return BadRequest(result.Errors);
            
        var key = await service.CreateWithdrawal(request);
        return CreatedAtAction(nameof(GetWithdrawal), new { id = key }, new CreateResponse(key));
    }
        
    [HttpPut]
    public async Task<ActionResult> UpdateWithdrawal([FromServices] AbstractValidator<UpdateWithdrawalRequest> validator, UpdateWithdrawalRequest request)
    {
        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return BadRequest(result.Errors);
            
        var updateResult = await service.UpdateWithdrawal(request);
        if (updateResult.NotFound)
            return NotFound();
            
        if (!updateResult.Succeeded)
            return BadRequest(updateResult.ToFluentResult());
            
        return NoContent();
    }
        
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteSupplement(int id)
    {
        var result = await service.DeleteWithdrawal(id);
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
        WithdrawalDocument? result;
            
        if (!id.HasValue) 
            result = await context.WithdrawalDocuments.AsNoTracking().FirstOrDefaultAsync(x => x.Number == name);
        else 
            result = await context.WithdrawalDocuments.AsNoTracking().FirstOrDefaultAsync(x => x.Number == name && x.Id != id);
        return result != null;
    }
        
    [HttpGet("filter-state")]
    public async Task<WithdrawalFilterState> GetFilterViewModelState([FromServices] IViewModelStateService stateService, int? docsLimit, int? customersLimit)
    {
        var model = await stateService.GetWithdrawalFilterState(docsLimit, customersLimit);
        return model;
    }
}