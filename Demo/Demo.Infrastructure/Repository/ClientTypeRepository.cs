using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using additiv.Infrastructure.Repositories;
using Demo.Domain.BusinessEntity;
using Demo.Domain.Repository;

namespace Demo.Infrastructure.Repository
{
   public  class ClientTypeRepository : Repository<ClientType>, IClientTypeRepository
    {
        public ClientTypeRepository(UnitOfWork unit) : base(unit)
        {
            
        }

    }
}
