using System;
using System.Collections;
using System.Collections.Generic;
using System.Web.Routing;
using additiv.Imcs.Backend.Module.Core.Text;
using additiv.Imcs.Backend.Module.Web.Utilities;
using additiv.Infrastructure.Repositories;
using Microsoft.Practices.Unity;
using Demo.Infrastructure.EntityFramework;
using Demo.Domain.Repository;
using Demo.Infrastructure.Repository;

namespace Demo.Web
{
    public class DemoModuleRegistration : ModuleRegistration

    {
        public override string ModuleName
        {
            get
            {
                return "Demo";
            }
        }



        public override void RegisterModules(RouteCollection routes)
        {
            RegisterStandartRoute(routes, "Client", "Index");

        }

        public override void RegisterUnities(IUnityContainer unityContainer)
        {
            unityContainer.RegisterType<IDbContextProvider, DemoDbContextProvider>(ModuleName);
            unityContainer.RegisterType<IClientRepository, ClientRepository>();
            unityContainer.RegisterType<IClientTypeRepository, ClientTypeRepository>();
        }

        public override void RegisterCacheTables(ICollection<string> cacheableTables)
        {
        }

        public override void RegisterStyleSheets(ICollection<string> relativeUrls)
        {
            //relativeUrls.Add("Themes/additiv-imcs/styles.css");
            relativeUrls.Add("Themes/styles.css");
            relativeUrls.Add("Themes/bootstrap.css");
            //relativeUrls.Add("Site.css");
            relativeUrls.Add("Themes/bootstrap-table.css");
            relativeUrls.Add("Themes/module.css");

        }

        public override void RegisterJavaScripts(ICollection<string> relativeUrls)
        {
            relativeUrls.Add("Scripts/additiv-imcs/jquery.min.js");
            relativeUrls.Add("Scripts/additiv-imcs/jquery-ui-1.9.2.min.js");
            relativeUrls.Add("Scripts/additiv-imcs/jquery.unobtrusive-ajax.min.js");
            relativeUrls.Add("Scripts/additiv-imcs/MicrosoftAjax.js");
            relativeUrls.Add("Scripts/additiv-imcs/MicrosoftMvcAjax.js");
            relativeUrls.Add("Scripts/additiv-imcs/MicrosoftMvcValidation.js");
            relativeUrls.Add("Scripts/additiv-imcs/additiv.imcs.translations.js");
            relativeUrls.Add("Scripts/additiv-imcs/jquery.plugins.js");
            relativeUrls.Add("Scripts/additiv-imcs/additiv.modules.js");
            relativeUrls.Add("Scripts/bootstrap.js");
            relativeUrls.Add("Scripts/bootstrap-table.js");
        }
    }


}