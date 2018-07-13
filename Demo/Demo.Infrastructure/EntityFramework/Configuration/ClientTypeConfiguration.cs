using Demo.Domain.BusinessEntity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Infrastructure.EntityFramework.Configuration
{
    class ClientTypeConfiguration : EntityTypeConfiguration<ClientType>
    {
        public ClientTypeConfiguration()
        {
            HasKey(t => t.Id);
            Property(t => t.Id).HasColumnName("Id").HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity).IsRequired();
            Property(t => t.Name).HasColumnName("Name").HasMaxLength(50).IsRequired();
            ToTable("ClientType");
        }
    }
}
