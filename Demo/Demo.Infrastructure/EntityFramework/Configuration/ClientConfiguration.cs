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
    class ClientConfiguration : EntityTypeConfiguration<Client>
    {
        public ClientConfiguration()
        {
            HasKey(c => c.Id);
            Property(c => c.Id).HasColumnName("Id").HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity).IsRequired();
            Property(c => c.RegisterDate).HasColumnName("RegisterDate").IsRequired();
            Property(c => c.FirstName).HasColumnName("FirstName").HasMaxLength(20).IsRequired();
            Property(c => c.LastName).HasColumnName("LastName").HasMaxLength(20).IsRequired();
            Property(c => c.BirthDate).HasColumnName("BirthDate");
            Property(c => c.Email).HasColumnName("Email").HasMaxLength(50);
            Property(c => c.TypeId).HasColumnName("TypeId").IsRequired();
            HasRequired(c => c.Type).WithMany().HasForeignKey(c => c.TypeId);
            ToTable("Client");
        }
    }
}
