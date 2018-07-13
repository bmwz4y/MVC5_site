using NUnit.Framework;
using Demo.Web.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Web.Controllers.Tests
{
    [TestFixture()]
    public class ClientControllerTests
    {
        [Test()]
        public void IndexNUnitTest()
        {
            // is not seen by TFS build agent in Web Portal
            throw new NotImplementedException();
        }
    }
}