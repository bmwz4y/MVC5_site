using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using additiv.Core.Utilities;
using additiv.Imcs.Backend.Module.Core;

namespace Demo.Web
{
    internal class FakeTenantContext : ITenantContext
    {
        public string ConnectionString
        {
            get { return ConfigurationUtility.GetConnectionString("IMCS.Core"); }
        }

        public string GetSpecialConnectionString(string name)
        {
            switch (name)
            {
                default:
                    throw new NotImplementedException();
            }
        }

        public string GetTenantSetting(string key)
        {
            throw new NotImplementedException();
        }

        public string GetEntitySetting(int entityId, string key)
        {
            throw new NotImplementedException();
        }
    }
}