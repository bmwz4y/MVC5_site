using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Windows.Input;
using System.Windows.Forms;
using System.Drawing;
using Microsoft.VisualStudio.TestTools.UITesting;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.VisualStudio.TestTools.UITest.Extension;
using Microsoft.VisualStudio.TestTools.UITesting.HtmlControls;
using Keyboard = Microsoft.VisualStudio.TestTools.UITesting.Keyboard;


namespace Demo.CodedUITest
{
    /// <summary>
    /// This is my(YEH) hands-on trial of CodedUI testing framework
    /// it is very bad for now, why:
    /// - these methods are throwing too many errors 
    /// - as soon as I solve one error I'm faced with another
    /// - even when i tried simple steps like (4 steps) open browser > write address > press enter > click button in webpage
    /// - hanging too many times
    /// - have to use wait functionality
    /// - wait for ready functions aren't good because they don't work as expected many times
    /// - bad support of web browsers except microsoft's unnecessary IE, and the now new Edge
    /// - even when using IE not everything is working, some times a run throws error if I do small edits or add new step
    ///   , another is that simple DOM objects such as drop down lists aren't functioning.
    /// - using the UIMap editor isn't intuitive because for example it is sorted by name, doesn't have groups
    ///   , if one changes properties of the inner most ui control it may or may not work unless you change its parent's properties too
    /// - using the code only (no record) has it's own problems.
    /// - on the other hand, using MTM(microsoft test manager) is great for setting the manual test step and integrates seamlessly with TFS
    ///   , but again the resulting action recording needs alot of cleanup and fix errors.
    /// </summary>
    [CodedUITest]
    public class CodedUiTest1
    {
        public CodedUiTest1()
        {
        }

        [TestCategory("ExcludedTests")]
        [TestMethod]
        public void CodedUIchromeDevBrowsersync()
        {

            this.UIMap.putbrowsersinrespectiveorder();
            //this.UIMap.clickcreate1();
            this.UIMap.clickcreate1_1();
            this.UIMap.enterdetailsandselectbutleaveemailempty();
            this.UIMap.clickcreateadd();
            this.UIMap.clickcancel1();

        }

        [TestCategory("ExcludedTests")]
        [TestMethod]
        public void CodedUIwithBrowsersync()
        {
            //this.UIMap.Runcmd();
            //this.UIMap.Typestartchromehttplocalhost7981newWindowwindowsize683670windowposition68264autoopendevtoolsfortabs();
            string cmdText;
            cmdText = "/C start chrome \"http://localhost:7981/\" --new-Window --window-size=683,670 --window-position=682,64 --auto-open-devtools-for-tabs{Enter}";
            System.Diagnostics.Process.Start("CMD.exe", cmdText);

            this.UIMap.Switchbacktocmdwindowbyclickingalttab();
            this.UIMap.TypecdDYEHStudy2017201820181stCPE390CPE490PRACTICALTRAINING12MaterialDemoDemoWeb();
            this.UIMap.TypebrowsersyncstartfilesContentcssViewscshtmlproxylocalhost7981logLeveldebugbchromefirefoxiexplore();
            this.UIMap.Clickonfirefoxthenchromethenie();
            this.UIMap.ClickonCreate();
            this.UIMap.Putsomedatainthefirst2boxes();
            this.UIMap.ClickonAdd();
            this.UIMap.ClickCancel();
            this.UIMap.Assertthattableisseenbyclickanythinginsidetable();
        }

        [TestCategory("ExcludedTests")]
        [TestMethod]
        public void CodedUiTestFireFox()
        {
            this.UIMap.launchChrome();
            this.UIMap.launchIExplorer();

            this.UiMap.pre_LaunchFF();
            this.UiMap.pre_insertUrl();
            this.UiMap.pre_LoadUrl();

            //this.UIMap.scrollFFtheFillSomeSearch();

            this.UiMap.AssertAhmadName();

            //EnterText(this.UiMap.UISuperStartMozillaFirWindow, "Id", "please work");

            this.UIMap.FFClickCreateButton();
            //this.UIMap.browserSyncFFMain();
            this.UIMap.FFCreateDummy();
            Playback.Wait(1000);
            this.UIMap.FFCreateDummy_Save();

            //EnterText(this.UiMap.UISuperStartMozillaFirWindow, "FirstName", "please work");

            this.UiMap.post_ExitFF();
        }

        [TestCategory("ExcludedTests")]
        [TestMethod, Timeout(30000)]
        public void CodedUiTestMisc()
        {
            //var browser = BrowserWindow.Launch("http://localhost:7981/Client");
            //BrowserWindow.CurrentBrowser = "chrome";
            //Playback.Wait(1000);
            var browser = BrowserWindow.Launch("http://localhost:7981/Client/Create");
            Playback.Wait(1000);
            //browser.
            //this.UIMap.launchChromeClientCreate();
            //Keyboard.SendKeys(UIMap.UINewTabGoogleChromeWindow.UIItemGroup.UIAddressandsearchbarEdit, "{Enter}");

            //EnterText(UIMap.UINewTabGoogleChromeWindow, "FirstName", "please work");

            EnterText(browser, "FirstName", "please work");

            //this.UIMap.ClickCreate();

            //ClickLink(browser, "Create");
            ClickLink(browser, "Cancel");
        }

        //added method when seen the coded ui tutorial by DonovanBrown.com on youtube
        void ClickLink(UITestControl parent, string innerText)
        {
            //HtmlInputButton htmlInputButton = new HtmlInputButton(parent);
            //htmlInputButton.SearchProperties.Add(InnerText, innerText);
            //Mouse.Click(htmlInputButton);

            var link = new HtmlHyperlink(parent);
            link.SearchProperties.Add(HtmlControl.PropertyNames.InnerText, innerText);
            Mouse.Click(link);
        }

        void EnterText(UITestControl parent, string id, string value)
        {
            var edit = new HtmlEdit(parent);
            edit.SearchProperties.Add(HtmlControl.PropertyNames.Id, id);
            edit.Text = value;
        }

        void ClickButton(UITestControl parent, string value)
        {
            var button = new HtmlInputButton(parent);
            button.SearchProperties.Add(HtmlControl.PropertyNames.ValueAttribute, value);
            Mouse.Click(button);
        }

        #region Additional test attributes

        // You can use the following additional attributes as you write your tests:

        ////Use TestInitialize to run code before running each test 
        //[TestInitialize()]
        //public void MyTestInitialize()
        //{        
        //    // To generate code for this test, select "Generate Code for Coded UI Test" from the shortcut menu and select one of the menu items.
        //}

        ////Use TestCleanup to run code after each test has run
        //[TestCleanup()]
        //public void MyTestCleanup()
        //{        
        //    // To generate code for this test, select "Generate Code for Coded UI Test" from the shortcut menu and select one of the menu items.
        //}

        #endregion

        /// <summary>
        ///Gets or sets the test context which provides
        ///information about and functionality for the current test run.
        ///</summary>
        public TestContext TestContext
        {
            get
            {
                return _testContextInstance;
            }
            set
            {
                _testContextInstance = value;
            }
        }
        private TestContext _testContextInstance;

        public UIMap UiMap
        {
            get
            {
                if ((this._map == null))
                {
                    this._map = new UIMap();
                }

                return this._map;
            }
        }

        private UIMap _map;

        public UIMap UIMap
        {
            get
            {
                if ((this.map == null))
                {
                    this.map = new UIMap();
                }

                return this.map;
            }
        }

        private UIMap map;
    }
}
