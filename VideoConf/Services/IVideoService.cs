using System.Collections.Generic;
using System.Threading.Tasks;
using VideoConf.Models;

namespace VideoConf.Services
{
    public interface IVideoService
    {
        string GetTwilioJwt(string identity);
    }
}