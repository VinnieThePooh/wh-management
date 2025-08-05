using FluentValidation;
using Warehouse.WebApi.Models.Resources.Withdrawals;

namespace Warehouse.WebApi.Services.Withdrawals;

public class CreateWithdrawalValidator : AbstractValidator<CreateWithdrawalRequest>
{
    public CreateWithdrawalValidator()
    {
        RuleFor(x => x.DocumentNumber)
            .NotNull().WithMessage("WithdrawDocument number is required")
            .NotEmpty().WithMessage("WithdrawDocument number should not be empty");
        
        RuleFor(x => x.WithdrawalDate).NotNull().WithMessage("WithdrawDocument date is required");
        RuleFor(x => x.CustomerId).NotNull().WithMessage("WithdrawDocument CustomerId is required");
        
        RuleFor(x => x.Resources)
            .NotNull().WithMessage("WithdrawDocument resources is required")
            .NotEmpty().WithMessage("WithdrawDocument resources should not be empty"); }
}