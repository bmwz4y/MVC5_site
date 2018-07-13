using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Demo_Test.Models;

namespace Demo_Test.Controllers
{
    public class MainInfoController : Controller
    {
        // GET: MainInfo
        DemoDbEntities1 db = new DemoDbEntities1();

        public ActionResult Index()
        {


            var mainInfo = from m in db.MainInfoes
                select m;

            return View(mainInfo);

        }

        public ActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Create(MainInfo newUser)
        {

            if (ModelState.IsValid)
            {
                db.MainInfoes.Add(newUser);
                db.SaveChanges();

                return RedirectToAction("Index");
            }
            else
            {
                return View(newUser);
            }
        }
    }
}


       
    