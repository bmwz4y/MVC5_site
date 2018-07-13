using Demo.Web.Controllers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace Demo.UnitTest.Controllers
{
    [TestClass]
    public class AccountControllerTests
    {
        private MockRepository mockRepository;



        [TestInitialize]
        public void TestInitialize()
        {
            this.mockRepository = new MockRepository(MockBehavior.Strict);


        }

        [TestCleanup]
        public void TestCleanup()
        {
            this.mockRepository.VerifyAll();
        }

        [TestMethod]
        public void TestMethod1()
        {
            // Arrange


            // Act
            AccountController accountController = this.CreateAccountController();
            accountController.

            // Assert
            
        }

        private AccountController CreateAccountController()
        {
            return new AccountController();
        }
    }
}
