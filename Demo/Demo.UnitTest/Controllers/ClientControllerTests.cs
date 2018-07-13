using System.Web.Mvc;
using Demo.Domain.Repository;
using Demo.Web.Controllers;
using Demo.Web.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.Web.Infrastructure;
using Moq;

namespace Demo.UnitTest.Controllers
{
    [TestClass]
    public class ClientControllerTests
    {
        private MockRepository mockRepository;

        private Mock<IClientRepository> mockClientRepository;
        private Mock<IClientTypeRepository> mockClientTypeRepository;

        [TestInitialize]
        public void TestInitialize()
        {
            this.mockRepository = new MockRepository(MockBehavior.Strict);

            this.mockClientRepository = this.mockRepository.Create<IClientRepository>();
            this.mockClientTypeRepository = this.mockRepository.Create<IClientTypeRepository>();
        }

        [TestCleanup]
        public void TestCleanup()
        {
            this.mockRepository.VerifyAll();
        }

        [TestMethod()]
        public void ClientControllerEmptyTest()
        {
            /*
             * although this is an empty test I want to keep it that way
             *  to make sure of TFS build agent in Web Portal is working up to this test
             */
        }

        [TestMethod]
        [TestCategory("ExcludedTests")]
        public void TestMethod1()
        {
            /*
             * for now it only checks that it has the same view as wanted by name
             * TODO: mock the fetch options
             */
            // Arrange
            ClientController clientController = this.CreateClientController();
            //Mock<HttpContextHelper> mockHttpContextHelper;
            //clientController.ControllerContext = new ControllerContext(context.Object, new RouteData(), controller);

            //.UserPreferences.FetchOptions = FlexGridFetchOptionsModel();

            // Act
            var result = clientController.Index() as ViewResult;
            //call index return view and then test as you wanted back when the test was before

            // Assert
            Assert.AreEqual("Index", result.ViewName);
        }

        private ClientController CreateClientController()
        {
            return new ClientController(
                this.mockClientRepository.Object,
                this.mockClientTypeRepository.Object);
        }
    }
}
