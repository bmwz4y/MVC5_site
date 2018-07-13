using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using Demo.Infrastructure.EntityFramework.Configuration;

namespace Demo.Infrastructure.EntityFramework
{
    public class DemoDbContext : DbContext
    {
        public DemoDbContext(string nameOrConnectionString)
            : base(nameOrConnectionString)
        {
            Database.SetInitializer<DemoDbContext>(null);
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Configurations.Add(new ClientConfiguration());
            modelBuilder.Configurations.Add(new ClientTypeConfiguration());
        }
    }
}
