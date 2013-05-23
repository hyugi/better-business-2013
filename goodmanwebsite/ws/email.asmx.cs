using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net.Mail;
using Microsoft.Security.Application;
using System.Web.UI.HtmlControls;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;
using System.Web.Script.Services;

namespace goodmanwebsite.ws
{
    /// <summary>
    /// Summary description for email
    /// </summary>
    [WebService(Namespace = "http://www.goodman.com/betterbusiness/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class email : System.Web.Services.WebService
    {

        [WebMethod]
        public string HelloWorld(string input)
        {
            return "Hello World " + input;

        }

        //http://regexlib.com/Search.aspx?k=url&c=-1&m=-1&ps=20&p=1
        private static readonly Regex VALID_EMAIL = new Regex(@"^[\w\-]+(?:\.[\w\-]+)*@(?:[\w\-]+\.)+[a-zA-Z]{2,7}$", RegexOptions.Compiled);
        private static readonly Regex VALID_URL = new Regex(@"^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$", RegexOptions.Compiled);

        private string _errorMsg = "";
        private string environment = "@goodman.com";


        [WebMethod]
        public string sendComparisonMail(string inRecipientName, string inRecipientEmail, string inSenderName, string inSenderEmail, string inNote, string inExtras, string inComparisonURL)
        {

            string gbbMessageEC = "";

            //string[] inExtrasArray = inExtras.Split('|');

            try
            {
                _errorMsg = "";

                string RecipientName = Microsoft.Security.Application.Encoder.HtmlEncode(inRecipientName);
                string RecipientEmail = Microsoft.Security.Application.Encoder.HtmlEncode(inRecipientEmail);
                string SenderName = Microsoft.Security.Application.Encoder.HtmlEncode(inSenderName);
                string SenderEmail = Microsoft.Security.Application.Encoder.HtmlEncode(inSenderEmail);
                string Note = Microsoft.Security.Application.Encoder.HtmlEncode(inNote);
                string ComparisonURL = Microsoft.Security.Application.Encoder.HtmlEncode(inComparisonURL);

                string Extras = Microsoft.Security.Application.Encoder.HtmlEncode(inExtras);

                if (ValidatedEP(
                        RecipientName,
                        RecipientEmail,
                        SenderName,
                        SenderEmail
                    ))
                {

                    MailMessage oEmail = new MailMessage();

                    oEmail.To.Add(new MailAddress(RecipientEmail, ""));

                    oEmail.From = new MailAddress("noreply" + environment, "Goodman");
                    oEmail.Subject = "Here are some properties you might be interested in!";
                    oEmail.Body = BodyEmailEC(RecipientName,
                                                RecipientEmail,
                                                SenderName,
                                                SenderEmail,
                                                Note,
                                                Extras,
                                                ComparisonURL
                                                );

                    oEmail.IsBodyHtml = true;
                    SmtpClient MailClient = new SmtpClient();

                    MailClient.Send(oEmail);

                    gbbMessageEC = "email sent";

                }
                else
                {
                    throw new Exception(_errorMsg);
                }
            }
            catch (Exception ex)
            {
                gbbMessageEC = ex.Message;
            }

            return gbbMessageEC;

        }

        private string BodyEmailEC(string RecipientName,
                                    string RecipientEmail,
                                    string SenderName,
                                    string SenderEmail,
                                    string Note,
                                    string Extras,
                                    string ComparisonURL
                                     )
        {

            string retString = "";

            retString += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'><html xmlns='http://www.w3.org/1999/xhtml'><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /><title>Goodman Better Business - Property comparison</title><style>a:link {font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#77ac1c;}a:visited {font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#77ac1c;}</style></head><body><table width='600' border='0' align='center' cellpadding='0' cellspacing='0'><tr><td colspan='3'><img src='http://www.goodman.com/betterbusiness/img/email/propComparison_header.gif' width='600' height='104' alt='Goodman Better Business ' /></td></tr><tr><td width='105' rowspan='3'><img src='http://www.goodman.com/betterbusiness/img/email/spacer.gif' width='105' height='1' /></td><td width='474'><p style='margin-top:40px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#77ac1c; font-weight:bold; line-height:1.2em;'>Hi  ";
            retString += RecipientName;
            retString += ",</p><p style='font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#333; margin:0px;line-height:0px;'>";
            retString += SenderName;
            retString += " (";
            retString += SenderEmail;
            retString += ") has sent you a selection of properties to compare.</p><p style='font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#333; line-height:1.4em; margin-bottom:20px;'>";
            retString += Note;
            retString += "</p></td><td width='15' rowspan='3'><img src='http://www.goodman.com/betterbusiness/img/email/spacer.gif' width='15' height='15' /></td></tr><tr><td><table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td height='56' valign='top'><!--** link to full comparison table **--><a href='";
            retString += ComparisonURL;
            retString += "' target='_blank'><img src='http://www.goodman.com/betterbusiness/img/email/propComparison_shortlistHeader.gif' alt='shortlisted properties' width='480' height='36' border='0' /></a></td></tr>";

            string[] inExtrasArray = Extras.Split('*');

            for (int i = 0; i < inExtrasArray.Length; i++)
            {
                string[] propertArray = inExtrasArray[i].ToString().Split('|');


                retString += "<!--** PROPERTY LOOP **-->";
                retString += "<tr><td><table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td width='169'><img src='";
                retString += propertArray[0];//PropertyThumbnail
                retString += "' name='' width='169' height='169' alt='' /></td><td width='18' rowspan='2'><img src='http://www.goodman.com/betterbusiness/img/email/spacer.gif' width='18' height='18' /></td><td rowspan='2' valign='top'><p style='font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:bold;color:#77ac1c;'>";
                retString += propertArray[1];//"[PropertyName]"
                retString += "<br /><span style='color:#333;font-weight:normal;'>";
                retString += propertArray[2];//"[property address1]"
                retString += ", ";
                retString += propertArray[3];//"[property address2]"
                retString += "</span></p><p style='color:#333;font-weight:normal;font-family:Arial, Helvetica, sans-serif;color:#333;font-size:13px;font-weight:normal;'>Property type: <span style='font-weight:bold;'>";
                retString += propertArray[4];//"[propertyType]"
                retString += "</span><br />Total size: <span style='font-weight:bold;'>";
                retString += propertArray[5];//"[propertySize]"
                retString += "</span><br /><a href='";
                retString += propertArray[9];//"#link"
                retString += "' target='_blank'><img src='http://www.goodman.com/betterbusiness/img/email/propComparison_viewPropertyBtn.gif' alt='view property' width='169' height='27' border='0' /></a> </p></td></tr><tr><td valign='top'><!--** link to single property detail **--></td></tr>";
                retString += "<tr><td height='20' colspan='3'><!--** ignore this if its the last property in the loop **--><div style='height:20px; border-bottom:solid 1px #cbcbcb;'></div></td></tr>";
                retString += "</table></td></tr>";
                retString += "<!--** END PROPERTY LOOP **-->";

            }

            retString += "<tr><td height='56' valign='bottom'><!--** link to full comparison table **--><a href='";
            retString += ComparisonURL;
            retString += "' target='_blank'><img src='http://www.goodman.com/betterbusiness/img/email/propComparison_shortlistHeader.gif' alt='shortlisted properties' width='480' height='36' border='0' /></a></td></tr></table></td></tr><tr><td><table width='480' border='0' cellspacing='0' cellpadding='0'><tr><td width='187' rowspan='2' valign='top'><img src='http://www.goodman.com/betterbusiness/img/email/prop_footerDesktop.jpg' width='187' height='126' /></td><td valign='top'><!--** link to comparison table **--><a href='";
            retString += ComparisonURL;
            retString += "' target='_blank'><img src='http://www.goodman.com/betterbusiness/img/email/propComparison_footerJumpBtn.gif' width='293' height='98' border='0' /></a></td></tr><tr><td align='center'><a href='http://www.goodmanbetterbusiness.com' target='_blank'  style='font-size:13px; font-family:Arial, Helvetica, sans-serif;font-weight:bold;color:#525252;text-decoration:none;'>www.goodmanbetterbusiness.com</a></td></tr></table></td></tr></table></body></html>";

            return retString;

        }



        [WebMethod]
        //public string sendPropertyMail(string inRecipientEmail, string inSenderName, string inSenderEmail, string inPropertyName, string inPropertyAddress1, string inPropertyAddress2, string inPropertyURL, string inNote, string extras)
        public string sendPropertyMail(string inRecipientName, string inRecipientEmail, string inSenderName, string inSenderEmail, string inNote, string inExtras)
        {

            string gbbMessageEP = "";

            string[] inExtrasArray = inExtras.Split('|');

            try
            {
                _errorMsg = "";

                //for info on AntiXss, see http://msdn.microsoft.com/en-us/library/aa973813.aspx
                string RecipientName = Microsoft.Security.Application.Encoder.HtmlEncode(inRecipientName);
                string RecipientEmail = Microsoft.Security.Application.Encoder.HtmlEncode(inRecipientEmail);
                string SenderName = Microsoft.Security.Application.Encoder.HtmlEncode(inSenderName);
                string SenderEmail = Microsoft.Security.Application.Encoder.HtmlEncode(inSenderEmail);
                string Note = Microsoft.Security.Application.Encoder.HtmlEncode(inNote);

                string PropertyThumbnail = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[0]);
                string PropertyName = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[1]);
                string PropertyAddress1 = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[2]);
                string PropertyAddress2 = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[3]);
                string PropertyType = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[4]);
                string PropertySize = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[5]);
                string GoodmanAgent = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[6]);
                string GoodmanAgentEmail = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[7]);
                string GoodmanAgentContactNumber = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[8]);
                string PropertyURL = Microsoft.Security.Application.Encoder.HtmlEncode(inExtrasArray[9]);

                if (ValidatedEP(
                        RecipientName,
                        RecipientEmail,
                        SenderName,
                        SenderEmail
                    ))
                {

                    MailMessage oEmail = new MailMessage();

                    oEmail.To.Add(new MailAddress(RecipientEmail, ""));

                    oEmail.From = new MailAddress("noreply" + environment, "Goodman");
                    oEmail.Subject = "Here's a property you might be interested in!";
                    oEmail.Body = BodyEmailEP(RecipientName,
                                                RecipientEmail,  
                                                SenderName,  
                                                SenderEmail,  
                                                Note,
                                                PropertyThumbnail,
                                                PropertyName,
                                                PropertyAddress1,
                                                PropertyAddress2,
                                                PropertyType,
                                                PropertySize,
                                                GoodmanAgent,
                                                GoodmanAgentEmail,
                                                GoodmanAgentContactNumber,
                                                PropertyURL
                                                );

                    oEmail.IsBodyHtml = true;
                    SmtpClient MailClient = new SmtpClient();

                    MailClient.Send(oEmail);

                    gbbMessageEP = "email sent";

                }
                else
                {
                    throw new Exception(_errorMsg);
                }
            }
            catch (Exception ex)
            {
                gbbMessageEP = ex.Message;
            }

            return gbbMessageEP;

        }

        private string BodyEmailEP(string RecipientName,
                                    string RecipientEmail, 
                                    string SenderName, 
                                    string SenderEmail, 
                                    string Note,
                                    string PropertyThumbnail,
                                    string PropertyName,
                                    string PropertyAddress1,
                                    string PropertyAddress2,
                                    string PropertyType,
                                    string PropertySize,
                                    string GoodmanAgent,
                                    string GoodmanAgentEmail,
                                    string GoodmanAgentContactNumber,
                                    string PropertyURL
                                    )
        {

            string retString = "";


            retString += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'><html xmlns='http://www.w3.org/1999/xhtml'><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /><title>Goodman Better Business - Property recommendation</title><style>a:link {font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#77ac1c;}a:visited {font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#77ac1c;}</style></head><body><table width='600' border='0' align='center' cellpadding='0' cellspacing='0'><tr><td colspan='3'><img src='http://www.goodman.com/betterbusiness/img/email/singleProp_header.gif' width='600' height='90' alt='Goodman Better Business ' /></td></tr><tr><td width='105' rowspan='3'><img src='http://www.goodman.com/betterbusiness/img/email/spacer.gif' width='105' height='1' /></td><td width='474'><p style='margin-top:40px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#77ac1c; font-weight:bold; line-height:1.2em;'>Hi ";
            retString += RecipientName;
            retString += ",</p><p style='font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#333; margin:0px;line-height:0px;'>";
            retString += SenderName; 
            retString += " ";
            retString += "("+SenderEmail+")"; 
            retString += " has recommended a property for you to view.</p><p style='font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#333; line-height:1.4em; margin-bottom:20px;'>";
            retString += Note;
            retString += "</p></td><td width='15' rowspan='3'><img src='http://www.goodman.com/betterbusiness/img/email/spacer.gif' width='15' height='15' /></td></tr><tr><td><table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td width='158' valign='top'><img src='";
            retString += PropertyThumbnail;
            retString += "' alt='' name='' width='169' /></td><td width='18' rowspan='4'><img src='http://www.goodman.com/betterbusiness/img/email/spacer.gif' width='18' height='18' /></td><td width='293' rowspan='4' valign='top'><p style='font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:bold;color:#77ac1c;'>";
            retString += PropertyName;
            retString += "<br /><span style='color:#333;font-weight:normal;'>";
            retString += PropertyAddress1;
            retString += ", ";
            retString += PropertyAddress2;
            retString += "</span></p><p style='color:#333;font-weight:normal;font-family:Arial, Helvetica, sans-serif;color:#333;font-size:13px;font-weight:normal;'>Property type: <span style='font-weight:bold;'>";
            retString += PropertyType;
            retString += "</span><br />Total size: <span style='font-weight:bold;'>";
            retString += PropertySize;
            retString += "</span></p><p style='font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#333;margin-bottom:20px;'>Contact ";
            retString += GoodmanAgent;
            retString += "<br /><span><a href='mailto:' style='font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#77ac1c;'>";
            retString += GoodmanAgentEmail;
            retString += "</a></span><br />";
            retString += GoodmanAgentContactNumber;
            retString += "<br /><a href='";
            retString += PropertyURL;
            retString += "' target='_blank'><img src='http://www.goodman.com/betterbusiness/img/email/singleProp_viewFullPropertyBtn.gif' alt='view property' width='169' height='22' border='0' style='margin:15px 0px;'/></a></p></td></tr></table></td></tr><tr><td><table width='480' border='0' cellspacing='0' cellpadding='0'><tr><td width='187' rowspan='2' valign='top'><img src='http://www.goodman.com/betterbusiness/img/email/prop_footerDesktop.jpg' width='187' height='126' /></td><td valign='top'><a href='";
            retString += PropertyURL;
            retString += "' target='_blank'><img src='http://www.goodman.com/betterbusiness/img/email/singleProp_footerJumpBtn.gif' width='293' height='98' border='0' /></a></td></tr><tr><td align='center'><a href='http://www.goodmanbetterbusiness.com' target='_blank'  style='font-size:13px; font-family:Arial, Helvetica, sans-serif;font-weight:bold;color:#525252;text-decoration:none;'>www.goodmanbetterbusiness.com</a></td></tr></table></td></tr></table></body></html>";

            return retString;

        }

        private bool ValidatedEP(
                        string RecipientName,
                        string RecipientEmail,
                        string SenderName,
                        string SenderEmail
     )
        {
            if (string.IsNullOrEmpty(RecipientName))
            {
                _errorMsg += "please enter the recipient name<br />";
            }

            if (!ValidateEmail(RecipientEmail))
            {
                _errorMsg += "please enter a valid recipient email<br />";
            }

            if (string.IsNullOrEmpty(SenderName))
            {
                _errorMsg += "please enter the sender name<br />";
            }

            if (!ValidateEmail(SenderEmail))
            {
                _errorMsg += "please enter a valid sender email<br />";
            }

 
            if (_errorMsg != "")
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        [WebMethod]
        public string sendMail(string inFirstName, string inLastName, string inCompany, string inEmail, string inMessage)
        {

            string gbbMessage = "";

            try
            {
                _errorMsg = "";

                //Control gbbMessage = (HtmlInputText)this.FindControl("gbbMessage");

                //for info on AntiXss, see http://msdn.microsoft.com/en-us/library/aa973813.aspx
                string SenderFirstName = Microsoft.Security.Application.Encoder.HtmlEncode(inFirstName);
                string SenderLastName = Microsoft.Security.Application.Encoder.HtmlEncode(inLastName);
                string SenderCompany = Microsoft.Security.Application.Encoder.HtmlEncode(inCompany);
                string SenderEmail = Microsoft.Security.Application.Encoder.HtmlEncode(inEmail);
                //string SenderSubject = Microsoft.Security.Application.Encoder.HtmlEncode(inSubject);
                string SenderMessage = Microsoft.Security.Application.Encoder.HtmlEncode(inMessage);

                //string RecipientName = "Scott McDonald";
                //string RecipientEmail = "scottocorp@hotmail.com";

                if (Validated(
                        SenderFirstName,
                        SenderLastName,
                        SenderCompany,
                        SenderEmail,
                        //SenderSubject,
                        SenderMessage
                    ))
                {

                    MailMessage oEmail = new MailMessage();

                    //oEmail.Bcc.Add(new MailAddress("scott@totemcomms.com.au", "Scott McDonald"));
                    //oEmail.CC.Add(new MailAddress("scott@totemcomms.com.au", "Scott McDonald"));
                    oEmail.Bcc.Add(new MailAddress("scott@totemcomms.com.au", "Scott McDonald"));
                    oEmail.To.Add(new MailAddress("leasing@goodman.com", "Leasing at Goodman"));

                    oEmail.From = new MailAddress("leasing" + environment, "Leasing at Goodman");
                    oEmail.Subject = "Better Business Website enquiry";
                    oEmail.Body = BodyEmail(SenderFirstName, SenderLastName, SenderCompany, SenderEmail, SenderMessage);

                    oEmail.IsBodyHtml = true;
                    SmtpClient MailClient = new SmtpClient();

                    MailClient.Send(oEmail);

                    gbbMessage = "email sent: " + SenderFirstName + " " + SenderLastName + " " + SenderCompany + " " + SenderEmail + " " + SenderMessage;

                }
                else
                {
                    throw new Exception(_errorMsg);
                }
            }
            catch (Exception ex)
            {
                gbbMessage = ex.Message;
            }

            return gbbMessage;

        }

        private string BodyEmail(string SenderFirstName, string SenderLastName, string SenderCompany, string SenderEmail, string SenderMessage)
        {

            string retString = "";

            retString = String.Format(@"<p>From: {0} {1}</p><p>Company: {2}</p><p>Email: {3}</p><p>Message: {4}</p>",
                        SenderFirstName,
                        SenderLastName,
                        SenderCompany,
                        SenderEmail,
                        SenderMessage
                );

            return retString;

        }

        private bool Validated(
                    string SenderFirstName,
                    string SenderLastName,
                    string SenderCompany,
                    string SenderEmail,
                    string SenderMessage
            )
        {
            if (string.IsNullOrEmpty(SenderFirstName))
            {
                _errorMsg += "please enter your first name<br />";
            }

            if (string.IsNullOrEmpty(SenderLastName))
            {
                _errorMsg += "please enter your last name<br />";
            }

            if (string.IsNullOrEmpty(SenderCompany))
            {
                _errorMsg += "please enter your company<br />";
            }

            if (!ValidateEmail(SenderEmail))
            {
                _errorMsg += "please enter a valid email<br />";
            }

            if (string.IsNullOrEmpty(SenderMessage))
            {
                _errorMsg += "please enter your message<br />";
            }

            if (_errorMsg != "")
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        private bool ValidateEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            return VALID_EMAIL.IsMatch(email);
        }

        private bool ValidateUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
                return false;

            return VALID_URL.IsMatch(url);
        }


    }
}
