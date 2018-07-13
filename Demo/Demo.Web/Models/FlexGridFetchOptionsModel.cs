using additiv.Imcs.Web.Widgets.FlexiGrid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Demo.Web.Models
{
    public abstract class FlexGridFetchOptionsModel
    {
        public FlexGridFetchOptionsModel()
        {
            FetchOptions = new FlexGridFetchOptions();
        }

        public FlexGridFetchOptions FetchOptions { get; set; }
    }
}