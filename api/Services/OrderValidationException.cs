namespace KoolFruits.Api.Services;

public class OrderValidationException(string field, string message) : Exception(message)
{
    public string Field { get; } = field;
}
