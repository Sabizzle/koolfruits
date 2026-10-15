using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using KoolFruits.Api.Options;

namespace KoolFruits.Api.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController(IOptions<BusinessOptions> business) : ControllerBase
{
    [HttpGet]
    public ActionResult<BusinessOptions> GetConfig()
    {
        return Ok(business.Value);
    }
}
