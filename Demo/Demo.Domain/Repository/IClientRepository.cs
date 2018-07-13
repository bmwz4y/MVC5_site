using additiv.Core.Repositories;
using Demo.Domain.BusinessEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Demo.Domain.Dto;

namespace Demo.Domain.Repository
{
    public interface IClientRepository : IRepository<Client>
    {
        Client GetById(int id);
        void Save(Client client);
        IEnumerable<Client> GetPaging(string search, string sortname, string sortorder);
    }
}
