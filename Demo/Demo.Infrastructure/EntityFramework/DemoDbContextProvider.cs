using additiv.Imcs.Backend.Module.Core;
using additiv.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Infrastructure.EntityFramework
{
    public class DemoDbContextProvider : IDbContextProvider
    {
        public DbContext DbContext { get; private set; }

        public DemoDbContextProvider(ITenantContext tenantContext)
        {
            DbContext = new DemoDbContext(tenantContext.ConnectionString);
        }
    }
}
