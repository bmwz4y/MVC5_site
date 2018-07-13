using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Domain.Dto
{
    public interface IClientFilter
    {
        int? Id { get; set; }
        string FirstName { get; set; }
        byte? TypeId { get; set; }
        DateTime? BirthDate { get; set; }
    }
}
