using currency_exchanger.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml;

namespace currency_exchanger.Controllers
{
	public class HomeController : Controller
	{
		ExchangeDB context = new ExchangeDB();

		public ActionResult Index()
		{
			return View();
		}

		public JsonResult ConvertRate(string from, string to, string value)
		{
			decimal fromvalue;
			try
			{
				fromvalue = Convert.ToDecimal(value);
			}
			catch(Exception e)
			{
				return null;
			}

			if (context.rates.Where(w=>w.time == DateTime.Today).Count() == 0)
			{
				//no data saved for today
				SaveRateForDate();
			}

			var lastRate = context.rates.OrderByDescending(o=>o.time).First();

			decimal result = (fromvalue / Convert.ToDecimal(lastRate[from])) * Convert.ToDecimal(lastRate[to]);
			return new JsonResult()
			{
				Data = new { data = JsonConvert.SerializeObject(result.ToString("F")) },
				JsonRequestBehavior = JsonRequestBehavior.AllowGet
			};
		}

		protected void SaveRateForDate()
		{
			var stored = context.rates.Select(s => s.time).ToList();

			string ApiUrl = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
			XmlDocument doc = new XmlDocument();
			doc.Load(ApiUrl);

			XmlNode root = doc.DocumentElement;

			bool changes = false;
			foreach (XmlNode item in root.ChildNodes[2].ChildNodes)
			{
				DateTime timeToCheck = DateTime.Parse(item.Attributes["time"].Value);

				if (!stored.Contains(timeToCheck)){
					Rates newRate = new Rates();
					newRate["time"] = timeToCheck;
					foreach (XmlNode i in item.ChildNodes)
					{
						newRate[i.Attributes[0].Value] = Convert.ToDecimal(i.Attributes[1].Value);
					}
					newRate["EUR"] = new decimal(1);
					context.rates.Add(newRate);
					changes = true;
				}
			}
			if (changes)
			{
				context.SaveChanges();
			}
		}

		public JsonResult GetGraphData()
		{
			return new JsonResult()
			{
				Data = new { data = JsonConvert.SerializeObject(context.rates.ToList()) },
				JsonRequestBehavior = JsonRequestBehavior.AllowGet
			};
		}
	}
}