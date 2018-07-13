using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Resources;
using System.Security.AccessControl;
using System.Web;
using System.Web.Mvc;
using additiv.Imcs.Web.Widgets.FlexiGrid.Model;
using Demo.Domain.BusinessEntity;
using Demo.Domain.Dto;
using Demo.Web.Models;
using ClientRes = Demo.Core.Resources.Client;
using CommonRes = Demo.Core.Resources.Common;

namespace Demo.Web.Models
{
    public class ClientModel
    {
        [Required]
        [Display(ResourceType = typeof(ClientRes), Name = "Id")]
        public int Id { set; get; }

        //[StringLength(20, MinimumLength = 3)]
        [Required]
        [Display(ResourceType = typeof(CommonRes), Name = "FirstName")]
        public string FirstName { get; set; }

        [Required]
        [Display(ResourceType = typeof(CommonRes), Name = "LastName")]
        public string LastName { get; set; }

        [Display(ResourceType = typeof(ClientRes), Name = "BirthDate")]
        public DateTime? BirthDate { set; get; }

        [Required]
        [Display(ResourceType = typeof(ClientRes), Name = "RegisterDate")]
        public DateTime RegisterDate { get; set; }

        //[EmailAddress]
        [Required]
        [Display(ResourceType = typeof(ClientRes), Name = "Email")]
        public string Email { get; set; }

        [Required]
        [Display(ResourceType = typeof(ClientRes), Name = "ClientType")]
        public byte TypeId { get; set; }


        public static ClientModel ConvertFromEntity(Client entity)
        {

            return new ClientModel
            {
                Id = entity.Id,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                BirthDate = entity.BirthDate,
                RegisterDate = entity.RegisterDate,
                Email = entity.Email,
                TypeId = entity.TypeId
            };

        }
        public static Client ConvertFromModel(ClientModel model)
        {
            return new Client
            {
                Id = model.Id,
                FirstName = model.FirstName,
                LastName = model.LastName,
                BirthDate = model.BirthDate,
                RegisterDate = model.RegisterDate,
                Email = model.Email,
                TypeId = model.TypeId
            };
        }


    }

    public class ClientListModel
    {
        public int Id { set; get; }

        public string FullName { set; get; }

        public string BirthDate { set; get; }

        public string RegisterDate { get; set; }

        public string Email { get; set; }

        public string Type { get; set; }


        public static IEnumerable<ClientListModel> ConvertFromEntity(List<Client> list)
        {
            return list.Select(ConvertFromEntity).ToList();
        }

        public static ClientListModel ConvertFromEntity(Client entity)
        {
            return new ClientListModel
            {
                Id = entity.Id,
                FullName = $"{entity.FirstName} {entity.LastName}",
                BirthDate = entity.BirthDate?.ToShortDateString() ?? "",
                RegisterDate = entity.RegisterDate.ToShortDateString(),
                Email = entity.Email,
                Type = entity.Type.Name
            };

        }
    }




    public class ClientFilterModel : FlexGridFetchOptionsModel, IClientFilter //can comment FlexGridFetchOptionsModel but need to change dependent codes
    {
        [Display(ResourceType = typeof(ClientRes), Name = "Id")]
        public int? Id { set; get; }

        [Display(ResourceType = typeof(CommonRes), Name = "FirstName")]
        public string FirstName { set; get; }


        [Display(ResourceType = typeof(ClientRes), Name = "BirthDate")]
        public DateTime? BirthDate { get; set; }

        //[Display(ResourceType = typeof(ClientRes), Name = "Email")]
        //public string Email { get; set; }

        [Display(ResourceType = typeof(ClientRes), Name = "ClientType")]
        public byte? TypeId { set; get; }

    }
}