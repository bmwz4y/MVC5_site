using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Domain.BusinessEntity
{
    public class Client
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? BirthDate { get; set; }
        public DateTime RegisterDate { get; set; }
        public string Email { get; set; }
        public byte TypeId { get; set; }
        public virtual ClientType Type { get; set; }
    }
}
