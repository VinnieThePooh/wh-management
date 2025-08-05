using FluentValidation.Results;

namespace Warehouse.WebApi.Models.Common;

/// <summary>
/// For Update/Delete operations
/// </summary>
public struct OperationResult()
{
    public bool NotFound { get; set; } = false;

    public bool Succeeded => !NotFound && Errors.Count == 0;
    public Dictionary<string, string> Errors { get; set; } = new();
    public bool HasErrors => Errors.Count != 0;

    public void AddError(string key, string value)
    {
        Errors.TryAdd(key, value);
    }

    public ValidationResult ToFluentResult()
    {
        return new ValidationResult(Errors.Select(x => new ValidationFailure(x.Key, x.Value)).ToList());
    }
}