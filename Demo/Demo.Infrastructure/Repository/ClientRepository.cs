using additiv.Infrastructure.Repositories;
using Demo.Domain.BusinessEntity;
using Demo.Domain.Repository;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using additiv.Imcs.Backend.Module.Core.Extensions;
using additiv.Imcs.Core.Domain;
using Demo.Domain.Dto;

namespace Demo.Infrastructure.Repository
{
    public class ClientRepository : Repository<Client>, IClientRepository
    {
        public ClientRepository(UnitOfWork unit) : base(unit)
        {
            
        }

        //this method returns a client based on client Id 
        public Client GetById(int id)
        {
            return DbSet.Where(c => c.Id == id).Include(c => c.Type).FirstOrDefault();
        }

        public void Save(Client client)
        {
            if (client.Id == 0)
            {
                client.RegisterDate = DateTime.Now;
                Add(client);
            }
            else
            {
                Update(client);
            }
        }

        public IEnumerable<Client> GetPaging(string search, string sortname, string sortorder)
        {
            
            var queryable = DbSet.AsQueryable();

            //add code to search clients
            
           //add code to sort based on sort name and sort order
           

            return queryable.ToList();
        }
    }
}
