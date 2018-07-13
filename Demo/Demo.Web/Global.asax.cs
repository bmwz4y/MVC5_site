using additiv.Core.Caching;
using additiv.Imcs.Backend.Module.Core;
using additiv.Imcs.Backend.Module.Web.Filters;
using additiv.Imcs.Backend.Module.Web.Utilities;
using additiv.Infrastructure.Logging;
using additiv.Infrastructure.Repositories;
using additiv.Web.DependencyInjection;
using additiv.Web.Filters;
using Microsoft.Practices.Unity;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Demo.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private static CultureInfo _serverCulture;

        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new LoggingHandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("{*favicon}", new { favicon = @"(.*/)?favicon.ico(/.*)?" });

            routes.MapRoute(
                "Default",
                "{controller}/{action}/{id}",
                new { controller = "Client", action = "Index", id = UrlParameter.Optional },
                null,
                new string[] { "additiv.Imcs.OrderManagement.Web.Controllers" }
            ).DataTokens.Add(ModuleRegistration.ConstStringModuleName, (new DemoModuleRegistration()).ModuleName);

        }

        protected void Application_BeginRequest(Object sender, EventArgs e)
        {
            System.Threading.Thread.CurrentThread.CurrentCulture = _serverCulture;
        }

        protected void Application_Start()
        {
            _serverCulture = (CultureInfo)CultureInfo.GetCultureInfo("en").Clone();
            _serverCulture.DateTimeFormat.ShortDatePattern = "dd.MM.yyyy";
            _serverCulture.DateTimeFormat.DateSeparator = ".";
            _serverCulture.DateTimeFormat.LongTimePattern = "HH:mm:ss";
            _serverCulture.DateTimeFormat.ShortTimePattern = "HH:mm";
            _serverCulture.DateTimeFormat.AMDesignator = string.Empty;
            _serverCulture.DateTimeFormat.PMDesignator = string.Empty;
            _serverCulture.NumberFormat.NumberGroupSeparator = "'";

            var unityContainer = InitUnityContainer();

            var unityDependencyResolver = new UnityDependencyResolver(unityContainer);
            DependencyResolver.SetResolver(unityDependencyResolver);

            AreaRegistration.RegisterAllAreas();

            ViewEngines.Engines.Clear();
            ViewEngines.Engines.Add(new RazorViewEngine());

            GlobalFilters.Filters.Add(new NoCacheFilterAttribute());

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            ModuleRegistration.RegisterAllModules(RouteTable.Routes, unityContainer, null);
        }

        protected void Application_AuthenticateRequest(Object sender, EventArgs e)
        {
            HttpContextHelper.AuthenticateRequestFake("test", 1, 1, 4, 2, "FakeTenant", ""); // no need to change this
        }

        private static IUnityContainer InitUnityContainer()
        {
            var container = new UnityContainer();

            LoggingHandleErrorAttribute.LogManager = new NLogLogManager();

            container.RegisterInstance(LoggingHandleErrorAttribute.LogManager);

            container.RegisterInstance<ICache>(new additiv.Web.Cache());

            container.RegisterType<ITenantContext, FakeTenantContext>();

            container.RegisterType<UnitOfWork>(new HttpContextLifetimeManager<UnitOfWork>());

            return container;
        }
    }
}
