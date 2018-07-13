using Demo.Domain.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Xml.Schema;
using additiv.Imcs.Backend.Module.Web.Utilities;
using additiv.Imcs.Web.Widgets.FlexiGrid;
using additiv.Imcs.Web.Widgets.FlexiGrid.Model;
using Demo.Domain.Dto;
using Demo.Web.Models;

using NLog;

namespace Demo.Web.Controllers
{
    public class ClientController : Controller
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        private readonly IClientRepository _clientRepository;
        private readonly IClientTypeRepository _clientTypeRepository;
        public ClientController(IClientRepository clientRepository, IClientTypeRepository clientTypeRepository)
        {
            _clientRepository = clientRepository;
            _clientTypeRepository = clientTypeRepository;
        }

        // GET: Client
        [HttpGet]
        public ActionResult Index()
        {
            InitializeListFilter();

            return View(new ClientFilterModel { FetchOptions = HttpContextHelper.UserPreferences.FetchOptions });
        }

        [HttpGet]
        public JsonResult List(string search, string sort, string order, int offset, int limit)
        {
            IEnumerable<ClientListModel> tableData = new List<ClientListModel>();
            tableData = ClientListModel.ConvertFromEntity(_clientRepository.GetPaging(search, sort, order).ToList());
            var rows = tableData.ToList().GetRange(offset, Math.Min(limit, tableData.Count() - offset));
            return Json(new { rows = rows, total = tableData.Count() }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult Create()
        {
            InitializeListFilter();
            return View("Edit", new ClientModel());
        }

        [HttpGet]
        public ActionResult Edit(int id)
        {
            var client = _clientRepository.GetById(id);
            if (client == null) return RedirectToAction("Index");

            InitializeListFilter();
            return View(ClientModel.ConvertFromEntity(client));
        }

        [HttpPost]
        public ActionResult Create(ClientModel model)
        {
            return SaveClient(model);
        }

        [HttpPost]
        public ActionResult Edit(ClientModel model)
        {
            return SaveClient(model);
        }

        [HttpPost]
        public JsonResult Delete(int[] clientIds)
        {
            StringBuilder result = new StringBuilder();
            foreach (var id in clientIds)
            {
                _clientRepository.Remove(_clientRepository.GetById(id));
            }
            _clientRepository.SaveChanges();

            //because .Remove is implemented as void instead of bool/int to know success/failure and .SaveChanges is void too
            foreach (var id in clientIds)
            {
                if (_clientRepository.GetById(id) != null)
                    result.AppendFormat("Client with Id = '{0}' wasn't removed\n", id);
            }
            if (result.Length == 0)
            {
                result.Append("success");
            }
            return Json(result.ToString());
        }

        [NonAction]
        private void InitializeListFilter()
        {
            try
            {
                ViewBag.ClientTypes = _clientTypeRepository.GetAll().AsEnumerable().Select(x => new SelectListItem
                {
                    Text = x.Name,
                    Value = Convert.ToString(x.Id)
                });
            }
            catch (Exception e)
            {
                /*
                 * ignore exception for now
                 * made this to test unit testing
                 * also the one in the Index.cshtml
                 */
            }
        }

        [NonAction]
        private ActionResult SaveClient(ClientModel model)
        {
            if (ModelState.IsValid)
                try
                {
                    var entity = ClientModel.ConvertFromModel(model);
                    _clientRepository.Save(entity);
                    _clientRepository.SaveChanges();
                    return RedirectToAction("Index");
                }
                catch (Exception e)
                {
                    Logger.Error(e);

                    ModelState.AddModelError(string.Empty, "Error saving.");
                }

            InitializeListFilter();
            return View("Edit", model);
        }
    }
}