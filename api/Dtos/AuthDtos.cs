using System.ComponentModel.DataAnnotations;

namespace KoolFruits.Api.Dtos;

public class LoginRequest
{
    [Required]
    public required string Username { get; set; }

    [Required]
    public required string Password { get; set; }
}

public record MeResponse(string Username);
