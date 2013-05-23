using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.Script.Services;
using Newtonsoft.Json;

namespace goodmanwebsite.ws
{
    /// <summary>
    /// Summary description for test
    /// </summary>
    [WebService(Namespace = "http://www.goodman.com/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    // [System.Web.Script.Services.ScriptService]
    public class test : System.Web.Services.WebService
    {

        [WebMethod]
        [ScriptMethod(UseHttpGet = true)]
        public string GetActiveProperties()
        {
            //https://www.google.com.au/#hl=en&gs_nf=1&cp=23&gs_id=7&xhr=t&q=enable+http+get+in+asmx&pf=p&output=search&sclient=psy-ab&oq=enable+http+get+in+asmx&aq=0&aqi=g1&aql=&gs_l=&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=8c94bba531e6309e&biw=1440&bih=733
            //http://support.microsoft.com/default.aspx?scid=kb;en-us;819267
            //ie: needed to add a snippet to web.config to get HTTP GET to show up in the web services desription page

            bluearc.IntegrationServices ws = new bluearc.IntegrationServices();
            string json = ws.GetActiveProperties("au");

            return json;
        }

        [WebMethod]
        [ScriptMethod(UseHttpGet = true)]
        public string GetBBXtras()
        {
            bluearc.IntegrationServices ws = new bluearc.IntegrationServices();
            string json = ws.GetBBXtras("au");

            return json;
        }

    }
}
