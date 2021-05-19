using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Twilio.Jwt.AccessToken;
using VideoConf.Models;
using VideoConf.Services;

namespace VideoConf.Controllers
{
    public class Person
    {
        public string identity { get; set; }
    }
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult GetToken([FromBody] Person identity)
            => new JsonResult(new {token = GetTwilioJwt(identity.identity), room = "hello", identity = identity.identity});

        public IActionResult GetChatToken(string identity)
        {
            return new JsonResult(new { token = GetTwilioJwt(identity), room = "hello", identity = identity });           
        }

        public string GetTwilioJwt(string identity)
        {
            var grant = new VideoGrant();
            grant.Room = "hello";
            var grants = new HashSet<IGrant> { grant };

            var ChatServiceSid = "IS962845ffb0fe45539e35e69de5cab884";

            if (ChatServiceSid != String.Empty)
            {
                var chatGrant = new ChatGrant()
                {
                    ServiceSid = ChatServiceSid
                };
                grants.Add(chatGrant);
            }
          
            return new Token("AC9f16cac3c3e7369a7ef3f450322a5487",
                          "SK30b1a0fab8d0480933c7d1180a6fbeea",
                          "RYHcqlAtR8JC44uXXbbhI7jP0hE9QSTQ",
                          identity: identity,
                          grants: grants).ToJwt();

        }

    }
}
