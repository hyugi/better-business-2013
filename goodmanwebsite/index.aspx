<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs" Inherits="goodmanwebsite.index" %>
<!DOCTYPE html>
<!-- paulirish.com/2008/conditional-stylesheets-vs-css-hacks-answer-neither/ -->
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!-- Consider adding a manifest.appcache: h5bp.com/d/Offline -->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">

  <!-- Use the .htaccess and remove these lines to avoid edge case issues.
       More info: h5bp.com/i/378 -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

  <title>Commercial Property, Business &amp; Office Space For Lease - Goodman</title>
<meta name="description" content=" Find Australian commercial properties, business & office spaces for lease. Smart maps show key factors & more. Bookmark & share new business spaces online. ">  <meta name="author" content="">

  <!-- Mobile viewport optimized: h5bp.com/viewport -->
 <!--  <meta name="viewport" content="width=device-width"> -->
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <!-- Styles the status bar -->
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />  
  <!-- Make it look like a native app -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <!-- Place favicon.ico and apple-touch-icon.png in the root directory: mathiasbynens.be/notes/touch-icons -->

  <link href="favicon.ico" rel="shortcut icon">
  <link href="apple-touch-icon-precomposed.png" rel="apple-touch-icon-precomposed">
  <link href="apple-touch-icon-72x72-precomposed.png" sizes="72x72" rel="apple-touch-icon-precomposed">
  <link href="apple-touch-icon-114x114-precomposed.png" sizes="114x114" rel="apple-touch-icon-precomposed">
  <link href="apple-touch-icon-57x57-precomposed.png" sizes="57x57" rel="apple-touch-icon-precomposed">

  <!-- Totem Styles -->
  <link href="css/styles.css?key=20130111" rel="stylesheet" type="text/css" >
  <link href="css/print.css?key=20130111" rel="stylesheet" type="text/css" media="print" />
  <!--[if IE 7]>
    <link href="css/ie7.css" rel="stylesheet" type="text/css" >
  <![endif]-->
  <!--[if lt IE 9]>
  <script src="js/html5shiv-printshiv.js"></script>
  <![endif]-->
  <!--[if IE]>
    <style>
    #search-container { margin-top: 30px !important; }
    </style>
  <![endif]-->

  <!-- More ideas for your <head> here: h5bp.com/d/head-Tips -->

  <!-- All JavaScript at the bottom, except this Modernizr build.
       Modernizr enables HTML5 elements & feature detects for optimal performance.
       Create your own custom Modernizr build: www.modernizr.com/download/ -->
  <script src="js/libs/modernizr-2.5.3.min.js"></script>


  <!--  :::::::::::::: APP TEMPLATES :::::::::::::::  -->

  <script  type="text/x-jquery-tmpl" id="property-marker-item-tmpl">
    <div class="propertyMarker">
      <div class="imageWrapper">
        <div class="locationMarker boxShadow"><span>${location}</span></div>
        <img src="img/goodcube.png" class="imageMarker"/>
      </div>
    </div>
  </script>

  <script  type="text/x-jquery-tmpl" id="region-marker-item-tmpl">
    <div class="goodmanMarker">
      <div class="imageWrapper">
        <div class="locationMarker boxShadow"><span>${location}</span></div>
        <img src="img/goodcube.png" class="imageMarker"/>
      </div>
    </div>
  </script>

  <!--  MY PROPERTY COMPARISON TEMPLATE   -->

  <script type="text/template" id="mycomparison-list-item-tmpl">
    <h4>
      <a class="destroy">
        <img src="img/closeComparison.png" border="0"/>
      </a>
      <a href="#displayname=${attributes.DisplayName}" style="text-decoration:none;color:white;"><span title="${attributes.PropertyName}">
        ${attributes.PropertyName}      
      </span></a>
    </h4>    
    <a href="#displayname=${attributes.DisplayName}"><img class="propertyImage" src="${attributes.Thumbnail}" alt="" /></a>
    <div class="propertyAddress">
      ${attributes.PropertyAddress1}, ${attributes.SubRegion}
    </div>   
    <div class="propertyDescription" id="myComparisonDescription">
      <span id="propertyStatus-${attributes.DisplayName}" class="propertyStatus"/>
      ${attributes.BriefDescription}
    </div>    
    <div class="propertyArea">${attributes.PropertySize}</div>    
    <div class="propertyDateAvailable" id="propertyDateAvailable-${attributes.DisplayName}"></div> 
    <div id="myComparisonAmentityContainer-${attributes.DisplayName}" class="amenityContainer comparisonAmenity"></div>
    <div class="propertyOther">
        <ul id="comparisonOtherItems-${attributes.DisplayName}" class="comparisonOtherItems"></ul>  
    </div>
    <div class="propertyOptions clearfix">
      <a href="#displayname=${attributes.DisplayName}" class="propertyOptionsButton">full details</a>
      <!-- <a href="" class="propertyOptionsButton">contact</a> -->
    </div>
  </script>

<!--  PROPERTY COMPARISON TEMPLATE   -->  
  <script type="text/template" id="comparison-list-item-tmpl">
     <h4>
      <a class="destroy">
        <img src="img/closeComparison.png" border="0"/>
      </a>
      <span title="${attributes.PropertyName}">
        ${attributes.PropertyName}      
      </span>
    </h4>    
    <img class="propertyImage" src="${attributes.Thumbnail}" alt="" />
    <div class="propertyAddress">
      ${attributes.PropertyAddress1}, ${attributes.SubRegion}
    </div>   
    <div class="propertyDescription" id="myComparisonDescription2">
      <span id="propertyStatus-${attributes.DisplayName}" class="propertyStatus"/>
      ${attributes.BriefDescription}
    </div>    
    <div class="propertyArea">${attributes.PropertySize}</div>    
    <div class="propertyDateAvailable" id="propertyDateAvailable2-${attributes.DisplayName}"></div> 
    <div id="comparisonAmentityContainer-${attributes.DisplayName}" class="amenityContainer comparisonAmenity"></div>
    <div class="propertyOther">   
        <ul id="comparisonOtherItems2-${attributes.DisplayName}" class="comparisonOtherItems"></ul>  
    </div>
    <div class="propertyOptions clearfix">
      <a href="#displayname=${attributes.DisplayName}" class="propertyOptionsButton">full details</a>
      <!-- <a href="" class="propertyOptionsButton">contact</a> -->
    </div>
  </script>
  

  <!--    PROPERTY INFO TEMPLATE   -->

    <script type="text/template" id="property-info-tmpl">

	<div class="propertySidebar clearfix darkGrey">
          <a href="#" id="close" style="">
            <img src="img/closeGrey.png" border="0"/>
          </a>
          <div class="propertySidebarHeader clearfix">
            <span class="propertyStatus" />
          </div>  
          <div id="propertySidebarGallery" class="propertySidebarGallery">
            <a href="#"><img src="${ Thumbnail }" alt="" /></a>          
          </div>
          <ul class="propertySidebarOptions darkGreyList">
            <li id="viewOnMapLi"><a id="viewOneMapLink" class="viewOnMapWhiteIcon">view on map</a></li>
            <li id="photosLi"><a class="photosWhiteIcon" href="" id="photos-property-trigger">photos (${ImagesCount})</a></li>
            <li id="videosLi"><a class="videosWhiteIcon" href="" id="videos-property-trigger">videos (${VideoURLsCount})</a></li>
            <li id="floorplanLi"><a class="floorplanWhiteIcon" href="" target="_blank">plans</a></li>
            <li id="brochureLi"><a class="brochureWhiteIcon" href="" target="_blank">brochure</a></li>
            <li id="emailLi"><a class="emailWhiteIcon" href="" id="email-property-trigger" >share</a></li>
            <li id="printLi"><a class="printWhiteIcon" href="#" onClick="window.print(); return false;" target="_blank">print</a></li>
          </ul>
          <ul id="downloadList" class="downloadList darkGreyList" style="display:none;"></ul>
        </div>

        <div class="propertyContent clearfix">
          <a id="comparison-add" href="#" style="text-decoration:underline;font-weight:bold;">
            <img src="img/addProperty.png" border="0"/>
            <div class="tooltip">
              <div class="tooltipArrow"></div>            
              <div id="addToListTooltip" class="darkGrey boxShadow">
                <span id="addToListTooltipCopy">Click to add this property to your shortlist.<br>
                Next, select the 'My Properties' icon in the header menu to compare or email your shortlisted properties
                </span>
                <span id="addToListTooltipIpadCopy">
                You have just added this property to your shortlist. 
                You can now select the 'my properties' icon in the header menu to compare or email your shortlisted properties.
                </span>
              </div>
            </div>
          </a>
          <div id="propertyInfoPrintPanel">
            <div id="propretyInfoPrintMainImage" style="display:none;" class="print-only"><img src="${ Thumbnail }" alt="" /></div>
            <div id="propertyInfoPrintDetail">
              <h2 id="propertyTitle" class="propertyName"> ${PropertyName} </h2>
              <p id="propertyDescription"> ${ PropertyAddress1 }, ${ SubRegion } </p>
              <p id="propertyInfoNewOrLeased" class="bold print-only" />
              <ul id="propertyDetailList">
                <li>Property type: <span class="bold"> ${ PropertyType } </span></li>
                <li>Total size: <span class="bold"> ${ PropertySize } </span></li>
                <li id="propertyInfoDateAvailable">Date Available: <span class="bold" /></li>
              </ul>
              <div id="propertyAmentityContainer" class="amenityContainer propertyInfoAmenity" />
            </div>
          </div>
          <div class="print-only clear"></div>
          <div id="propertyInfoPrintDetailPanel">
            <div class="propertyDescriptionContainer">
              <!-- <p class="propertyDescription" id="BriefDescriptionAdjusted" ></p> -->
              <ul ID="descriptionTabs" class="description-tabs clearfix">
                <li id="propertyDescriptionTabOverview" class="active-tab">Overview</li>
                <li id="propertyDescriptionTabFeatures" class="inactive-tab">Features</li>
              </ul>
              <div id="DetailedDescriptionAdjusted" class="propertyDescription propertyOverview" /> 
              <div id="DetailedDescriptionFeatures" class="propertyDescription propertyFeatures" style="display:none;" /> 
            </div>
            <div class="print-only clear"></div>
            <div id="propertyAgent" class="propertyAgent">
              <span class="title">Contact<span class="plus">+</span></span>
              <span class="propertyAgentName"> ${Contact1.split(",")[0]}  </span>
              <span class="propertyAgentEmail"> <a href='mailto:${$.trim(Contact1.split(",")[1])}' > ${Contact1.split(",")[1]}</a> </span>
              <span class="propertyAgentContact" />
            </div>
            <div id="propertyInfoAvailableOptionPanel" class="print-only">
              Visit this property listing at GoodmanBetterBusiness.com to view<br/>
              <ul id="propertyInfoAvailableOptions" />
            </div>
            <div id="propertyInfoDistancePanel">
              <ul id="propertyDistances" class="propertyDistances clearfix">
                <li class="propertyDistancesTitle">
                  <p>
                    Distance<br/>and routes
                  </p>
                </li>
                <li class="propertyDistanceItem">
                  <img src="img/route_airport.gif" class="route-icon print-only" />
                  <a href="#" class="property-info-route" id="airport">
                    <span id="distance-blurb-0"></span>
                  </a>
                </li>
                <li class="propertyDistanceItem">
                  <img src="img/route_city.gif" class="route-icon print-only" />
                  <a href="#" class="property-info-route" id="city">
                    <span id="distance-blurb-1"></span>
                  </a>
                </li>
                <li class="propertyDistanceItem">
                  <img src="img/route_seaport.gif" class="route-icon print-only" />
                  <a href="#" class="property-info-route" id="seaport">
                    <span id="distance-blurb-2"></span>
                  </a>
                </li>
                <li class="propertyDistanceItem propertyDistanceCustomRoute">
                  <img src="img/route_custom.gif" class="route-icon print-only" />
                  <a href="#" class="property-info-route" id="custom">
                    custom
                  </a>
                </li>
                <li style="display:none;font-size:12px;" id="custom-route-input">
                  
                     <input id="searchTextField" type="text" >

                </li>
              </ul>
            </div>
            <div id="propertyInfoPrintGoogleMap" style="display:none;" class="print-only" />
          </div>
          <div id="propertThumbnailPanel" style="display:none;" class="print-only">
            <ul id="propertThumbnails" />
          </div>

          <div class="print-only clear"></div>
          <div id="propertyInfoPrintFooter" style="display:none;" class="print-only">
            Property URL : <span id="propertyUrl" />
          </div>

        </div>
    </script>
  <!-- Tags from the property view

  <strong>id:</strong> ${ id } -->

	<!-- GALLERY TEMPLATE -->

    <script type="text/template" id="gallery-tmpl">
      <div class="galleryHeader darkGrey">
        <a href="#" id="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
        <h2>${PropertyName} Gallery</h2>
      </div>
      <div id="galleryPhotoContent" class="galleryContent">
        <h4>Photos</h4>
        <ul id="galleryContentList" class="clearfix">
        </ul>
      </div>
      <div id="galleryVideoContent" class="galleryContent">
       <h4>Videos</h4>
        <ul id="galleryVideoContentList" class="clearfix">
         </ul>
      </div>
  	</script>

	<!-- TESTIMONIALITEM TEMPLATE -->

    <script type="text/template" id="testimonialItem-tmpl">
      <div class="testimonialItemHeader darkGrey">
        <a href="#" id="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
        <h2>Testimonial Videos</h2>
      </div>
      <div id="testimonialItemContent" class="testimonialItemContent">
        <h4>Region Overviews</h4>
        <ul id="testimonialItemContentList" class="clearfix">
        /*
          <li class="testimonialItem">
              <a id="testimonial_${ id }" href='http://www.youtube.com/embed/endWFUDsumw?rel=0&wmode=transparent' rel='testimonialListVideo' class="testimonialListVideo">
               <div style='background:url(http://i2.ytimg.com/vi/endWFUDsumw/default.jpg) center center no-repeat;height: 76px;background-size: 91%;'></div>
               <p>Sydney South</p>
              </a>
           </li>
          <li class="testimonialItem">
              <a id="testimonial_${ id }" href='http://www.youtube.com/embed/ZkOy2ow4S5k?rel=0&wmode=transparent' rel='testimonialListVideo' class="testimonialListVideo">
               <div style='background:url(img/sydneyWest.jpg) center center no-repeat;height: 76px;background-size: 91%;'></div>
               <p>Sydney West</p>
              </a>
           </li>
          <li class="testimonialItem">
              <a id="testimonial_${ id }" href='http://www.youtube.com/embed/OpOj467a4m8?rel=0&wmode=transparent' rel='testimonialListVideo' class="testimonialListVideo">
               <div style='background:url(http://i2.ytimg.com/vi/OpOj467a4m8/default.jpg) center center no-repeat;height: 76px;background-size: 91%;'></div>
               <p>Sydney North</p>
              </a>
           </li>
           */
        </ul>
        <h4>Customer Testimonials</h4>
        <ul id="testimonialItemContentList2" class="clearfix"></ul>
       
      </div>
  	</script>

	<!-- EMAIL PROPERTY TEMPLATE -->

    <script type="text/template" id="email-property-tmpl">
    <div class="darkerGrey contact" id="emailProperty" >
      <div class="contactHeader boxShadow darkGrey">
        <a href="#" id="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
        <h2>Email a colleague</h2>
	  </div>
      <div class="contactContent">
      <ul class="contactDetails clearfix">
          <li class="propertyEmailThumbnail">
            <img src="${ Thumbnail }" alt="" />
          </li>
          <li  class="propertyEmailDetails">
            <h3>${ PropertyName } </h3>
            <p>${ PropertyAddress1 } ${ PropertyAddress2 }</p>
            <p>${ SubRegion }</p>
            <p>Property type: <span class="bold"> ${ PropertyType } </span></p>
            <p>Total size: <span class="bold"> ${ PropertySize } </span></p>
            <p> <a href="${ PropertyURL}" target="_blank">Direct Link</a></p>
          </li>
        </ul>
    	<ul class="contactForm">
            <li>
              <label>Colleague&acute;s Name</label>
      				<input id="gbb_ep_recipient_name" runat="server" name="gbb_ep_recipient_name" type="text" value="" />
    				</li>
            <li>
              <label>Colleague&acute;s Email </label>
      				<input id="gbb_ep_recipient_email" runat="server" name="gbb_ep_recipient_email" type="text" value="" />
    				</li>
            <li>
              <label>Your Name</label>
      				<input id="gbb_ep_sender_name" runat="server" name="gbb_ep_sender_name" type="text" value="" />
    				</li>
              <label>Your Email</label>
      				<input id="gbb_ep_sender_email" runat="server" name="gbb_ep_sender_email" type="text" value="" />
    				</li>
            <li>
              <label>Note</label>
      				<textarea id="gbb_ep_note" runat="server" name="gbb_ep_note" type="text" value="" />
            </li>
            <li class="submitLine">
              <input type="button" value="submit" id="submit" class="submit" onclick="GBB.emailPropertyValidate();"></input>
      			</li>
            <li ID="gbbMessageEP" runat="server" class="messageBox">
            </li>
        </ul>
      </div>
  	</script>

	<!-- EMAIL COMPARISON TEMPLATE -->

    <script type="text/template" id="email-comparison-tmpl">
    <div class="darkerGrey contact" id="emailComparison" >
      <div class="contactHeader boxShadow darkGrey">
        <a href="#" id="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
        <h2>Email a colleague</h2>
	  </div>
      <div class="contactContent">
    	<ul class="contactForm">
            <li>
              <label>Colleague&acute;s Name</label>
      				<input id="gbb_ec_recipient_name" runat="server" name="gbb_ec_recipient_name" type="text" value="" />
    				</li>
            <li>
              <label>Colleague&acute;s Email </label>
      				<input id="gbb_ec_recipient_email" runat="server" name="gbb_ec_recipient_email" type="text" value="" />
    				</li>
            <li>
              <label>Your Name</label>
      				<input id="gbb_ec_sender_name" runat="server" name="gbb_ec_sender_name" type="text" value="" />
    				</li>
              <label>Your Email</label>
      				<input id="gbb_ec_sender_email" runat="server" name="gbb_ec_sender_email" type="text" value="" />
    				</li>
            <li>
              <label>Note</label>
      				<textarea id="gbb_ec_note" runat="server" name="gbb_ec_note" type="text" value="" />
            </li>
            <li class="submitLine">
              <input type="button" value="submit" id="submit" class="submit" onclick="GBB.emailComparisonValidate();"></input>
      			</li>
            <li ID="gbbMessageEC" runat="server" class="messageBox">
            </li>
        </ul>
      </div>
  	</script>

    <!-- ROUTES FLYOUT -->
    <script type="text/template" id="route-info-tmpl">
      <div class="routeContainerOptions darkGrey">
        <a href="#" class="route-info-exit" id="property" style="">
          <img src="img/closeGrey.png" border="0"/>
        </a>
      </div>
      <div class="routeContent clearfix">  
        <div class="routeStart">
          <h3>${propertyname}</h3>
          <p>${PropertyAddress1}<br />${PropertyAddress2}</p>
        </div>
        <div class="routeArrow">
        </div>
        <div class="routeEnd">
          <h4>${destination}</h4>
          <p>${destinationAddress}</p>
          <p>Distance: <span id="distance-blurb-custom"></span></p>
        </div>
      </div>
     </script>

     <!-- Route links here just for reference
      <a href="#" class="route-info-exit" id="property" style="text-decoration:underline;font-weight:bold;">Back to property</a><br />
      <a href="#" class="route-info-exit" id="subregion" style="text-decoration:underline;font-weight:bold;">Back to subregion</a> -->

    <!-- END OF ROUTES -->

	<!-- PLACES POP UP -->
    <script type="text/template" id="google-place-info-tmpl">
      <div class="placesContainerOptions" style="loat:right; min-height:95px; width:45px;">
        <a href="#" id="close" class="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
      </div>
      <div class="placesContentPlace clearfix">
        <div class="placeContentWrapper">
          <h2>
            ${name}
          </h2>
          <div class="detailsPlace">
          <p><a style="text-decoration:underline;font-weight:bold;" target="_blank" href='${ website }'>${ website }</a></p>
          <p><a href='tel:${ formatted_phone_number }' class="phone-number">${ formatted_phone_number }</a></p>
          <p>${ formatted_address }</p>
          <p><a style="text-decoration:underline;font-weight:bold;" href='${ url }'  target="_blank" >More information</a></p>
          </div>
        </div>
      </div>
      
    </script>
  
    <script type="text/template" id="goodman-place-info-tmpl">
      <div class="placesContainerOptions" style="loat:right; min-height:95px; width:45px;">
        <a href="#" id="close" class="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
      </div>
       <div class="placesContentPlace clearfix">
        <div class="placeContentWrapper">
          <h2>
            ${name}
          </h2>
          <div class="detailsPlace">
            <p>${ description }</p>
            <p>${ location }</p>
          </div>
        </div>
      </div>
    </script>

    <!-- END OF PLACES POP UP -->
  
  <!-- TRAFFIC CAMERAS -->
    <script type="text/template" id="rtacam-place-info-tmpl">
        <div class="rtacamHeader darkGrey">
          <a href="#" id="close">
            <img src="img/closeGrey.png" border="0" />
          </a>
          <h2>${title} live traffic camera</h2>
        </div>
        <div class="rtacamContent darkerGrey">
          <a href="http://livetraffic.rta.nsw.gov.au/desktop.html#mapview" id="view" target="_blank" >
            <img src="${ href }" alt="${ title }" class="rtacamContentImage"/>
          </a>
        <div class="rtacamDescription">
          View: ${ view }
        </div>
        <p class="rtacamMessage">
          Images update approximately every 60 seconds
        </p>
        <p class="rtacamRefresh">
          <input type="button" value="Refresh" id="refresh"></input>    
        </p>
        </div>
    </script>
    <!-- END OF TRAFFIC CAMERAS -->

  <!-- CONTACT FORM -->

    <script type="text/template" id="contact-us-tmpl">
    <div class="darkerGrey contact" >
      <div class="contactHeader darkGrey">
        <a href="#" id="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
        <h2>Contact us</h2>
	  </div>
    <img src="img/contact.jpg" width="100%" />
      <div class="contactContent">
        <ul class="contactDetails clearfix">
          <li class="headOffice">Head Office</li>
          <li>
            <p>Level 17<br/>60 Castlereagh Street<br/>Sydney NSW 2000</p>
            <p><a href="tel:+61 2 9230 7400" class="phone-number">+61 2 9230 7400</a></p>
          </li>
          <li>
            <p>GPO Box 4703<br/>Sydney NSW 2001<br/>Australia</p>
            <p>leasing@goodman.com</p>
          </li>
        </ul>

    	<ul class="contactForm">
            <li>
              <label>First Name</label>
      				<input id="gbb_sender_first_name" runat="server" name="gbb_sender_first_name" type="text" value="" />
    				</li>
            <li>
              <label>Last Name</label>
              <input id="gbb_sender_last_name" runat="server" name="gbb_sender_last_name" type="text" value="" />
  					</li>
            <li>
              <label>Company</label>
              <input id="gbb_sender_company" runat="server" name="gbb_sender_company" type="text" value="" />
    				</li>
            <li>
              <label>Email</label>
      				<input id="gbb_sender_email" runat="server" name="gbb_sender_email" type="text" value="" />
    				</li>
            <li>
              <label>Message</label>
      				<textarea id="gbb_sender_message" runat="server" name="gbb_sender_message" type="text" value="" />
            </li>
            <li class="submitLine">
              <input type="button" value="submit" id="submit" class="submit" onclick="GBB.contactUsValidate();"></input>
      			</li>
            <li ID="gbbMessage" runat="server" class="messageBox">
            </li>
        </ul>
      </div>
    </script>

	<!-- ABOUT TEMPLATE -->

    <script type="text/template" id="about-tmpl">
      <div class="aboutHeader darkGrey">
        <a href="#" id="close">
          <img src="img/closeGrey.png" border="0" />
        </a>
        <h2>Put yourself in a better business position</h2>
      </div>
  		<div class="aboutMainBlurb">
        <p id="aboutBlurb"></p>
      </div>
      <div class="termsConditions darkerGrey">
        <h3 id="termsConditionsHeader" class="darkGrey boxShadow">Terms and Conditions
        <span id="statusHandle">
          <div class="arrowUp"></div>
          <div class="arrowDown"></div>
        </span>
        </h3>
        <div id="termsConditionsContent" style="display:none;">
        <p>These Website Terms and Conditions apply to the domain name www.goodmanbetterbusiness.com (&quot;Website&quot;) which is operated by Goodman Property Services (Aust) Pty Ltd ABN 40 088 981 793.</p>
        <p>Access to and use of this Website is subject to the following Terms and Conditions. By proceeding beyond the homepage you agree to be bound by such Terms and Conditions. We may revise these Terms and Conditions from time to time without notice and such revision will take effect when it is posted on this Website. Your continued use of this Website will be regarded as your acceptance of these Terms and Conditions as amended.</p>
        <p class="bold">Privacy Policy</p>
        <p>Goodman recognises that your privacy is important and is committed to protecting your personal information. Any personal information sent to this Website is subject to Goodman&acute;s Privacy Statement. For further information on Privacy Statement please navigate to the Privacy link contained on this Website.</p>
        <p class="bold">Accuracy, completeness and timeliness of information</p>
        <p>While Goodman provides the information that we make available on this website in good faith, we are not responsible if the information is not accurate or complete. Any reliance upon the material on this Website will be at your own risk. Information that we make available on this Website is subject to change without notice. It is your responsibility to monitor any changes to the material and the information contained on this Website.</p>
        <p class="bold">Intellectual property rights</p>
        <p>All copyright and other intellectual property rights in all text, images and other materials on this Website (&quot;Content&quot;) are the property of Goodman or are included with the permission of the relevant owner.</p>
        <p>You are permitted to browse this Website, reproduce extracts by way of printing for personal use, downloading to a hard disk or for the purposes of distribution to other individuals, provided that you keep intact all copyright and other proprietary notices. No reproduction of any part of this Website may be sold or distributed for commercial gain nor can it be modified or incorporated in any other work, publication or website. Except as expressly stated otherwise, nothing on this Website should be construed as granting any licence or right to use any copyright or other intellectual property right in the text, images and other materials on this Website.</p>
        <p>The trade marks, logos, characters and service marks displayed on this Website belong to Goodman or have been included with the permission of the relevant owner. Nothing on this Website should be construed as granting any licence or right to use any trade mark displayed on this Website. Your use or misuse of the trade marks displayed on this Website, or on any other Content on this Website, except as provided for in these terms and conditions, is strictly prohibited.</p>
        <p class="bold">Links</p>
        <p>This Website may contain links to other websites. The links are provided in good faith and Goodman accepts no responsibility for the availability, content, accuracy or function of these other websites. The inclusion of any link to other websites does not imply endorsement by Goodman. For information about any linked website, you should read the legal and privacy notices posted at that site.</p>
        <p class="bold">Disclaimer</p>
        <p>Your use of this Website is at your sole risk.</p>
        <p class="bold">Liability</p><p>To the extent permitted by law, Goodman does not accept liability or any responsibility whatsoever for any direct, incidental, consequential, indirect or punitive damages, costs, losses or liabilities whatsoever (including loss of profits, revenue or goodwill) arising out of your access to, use of or inability to use or access this Website or any change in content of this Website, or arising from any other website you access through a link from this Website or from any actions we take or fail to take as a result of any electronic mail messages you send us.</p>
        <p>To the extent permitted by law, Goodman does not accept any liability or responsibility to maintain the material and services made available on this Website or to supply any corrections, updates, or releases in connection with such materials and services.</p>
        <p>Goodman has no liability or any responsibility whatsoever for any loss suffered caused by viruses that may infect your computer equipment or other property by reason of your use of, access to or downloading of any material from this Website. You download material from this Website at your own risk.</p>
        <p>If applicable law implies terms which cannot be lawfully excluded, restricted or modified, then those terms will apply and, to the extent to permitted by law, Goodman&acute;s liability will be limited at its option to (a) in the case of services, resupplying the service or payment of the cost of resupply; and (b) in the case of goods, replacing or repairing the goods or payment of the cost of repair or replacement.</p>
        <p class="bold">Prohibited use</p>
        <p>You can only use this Website for lawful purposes and must comply with all applicable local, state, national and international laws and regulations that relate to your use of this Website. You are prohibited from posting on this Website any unlawful, harmful, abusive, threatening, harassing or defamatory material of any kind. You are also prohibited from disrupting or interfering with, or making attempts to disrupt or interfere with this Website or other user&acute;s enjoyment of this Website. Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your access to this Website. We also reserve the right to report potentially criminal activity to appropriate law enforcement agencies.</p>
        <p class="bold">Transmitted information</p>
        <p>Any non-personal information, communication or material you transmit to this Website (including data, suggestions, questions, comments etc.) will become the property of Goodman and will not be treated as confidential by Goodman. We may use all such information, communications and materials without obligation to you.</p>
        <p class="bold">Governing Law</p>
        <p>These Terms and Conditions are governed by and construed in accordance with the laws of New South Wales, Australia.</p>
        </div>
      </div>
  	</script>

  <!-- PROPERTY LIST TEMPLATE -->

    <script type="text/template" id="property-list-item-tmpl">
    <li class="propertyContent clearfix"><a id="${encodeURIComponent(attributes.DisplayName)}" href="#" class="clearfix" >
      <img src="${ attributes.Thumbnail }" alt="" class="property-list-item-image" />
      <p class="propertyDetails">
        <span class="propertyName">${ attributes.PropertyName }</span>
        ${ attributes.PropertySize }
      </p>
      </a>
    </li>

    </script>
    <!-- END OF PROPERTY LIST TEMPLATE -->

    <!-- TESTIMONIAL LIST TEMPLATE -->
    <script type="text/template" id="testimonial-list-item-tmpl">

           <li class="testimonialItem">
              <a id="testimonial_${ attributes.id }" href='http://www.youtube.com/embed/${attributes.url}?rel=0&wmode=transparent' rel='testtestimonial' class="testtestimonialVideo">
               <div style='height: 76px; width:100%;overflow:hidden;'>
                  <img src="http://i2.ytimg.com/vi/${attributes.url}/default.jpg" style="width:100%;display:block;margin-top:-15px;"/>
               </div>
               <p>${attributes.blurb}</p>
              </a>
           </li>

    </script>
    <!-- END OF TESTIMONIAL LIST TEMPLATE -->

    <!-- FEATURED LIST TEMPLATE -->

    <script type="text/template" id="featured-list-item-tmpl">
    <li class="propertyContent clearfix"><a id="${encodeURIComponent(attributes.DisplayName)}" class="clearfix" href="#" >
      <img src="${ attributes.Thumbnail }" alt="" class="property-list-item-image" />
      <p class="propertyDetails">
        <span class="propertyName">${ attributes.PropertyName }</span>
        ${ attributes.PropertySize }
      </p>
      </a>
    </li>

    </script>
      <!-- END OF FEATURED LIST TEMPLATE -->

    <!-- CITY SELECT TEMPLATE -->
    <script type="text/template" id="city-select-item-tmpl">
      <li><a href="#search-container">${attributes.City}</a></li>
    </script>

  <!-- HEADER DROPDOWN TEMPLATES -->    

    <script type="text/template" id="city-dropdown-menu-item-tmpl">
      <li>${attributes.City}</li>
    </script>
    
    <script type="text/template" id="region-dropdown-menu-item-tmpl">
      <li>${attributes.Region}</li>
    </script>
  
    <script type="text/template" id="subregion-dropdown-menu-item-tmpl">
     <li>${attributes.SubRegion}</li>
    </script>
  
    <script type="text/template" id="area-dropdown-menu-item-tmpl">
      <li>${attributes.AreaName}</li>
    </script>
  
    <script type="text/template" id="buildingtype-dropdown-menu-item-tmpl">
      <li>${attributes.BuildingTypeName}</li>
    </script>


<script type="text/javascript">

	var analayticsId = 'UA-2181734-33';
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', analayticsId]);

    (function () {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    function recordOutboundLink(link, category, action) {
        try {
            var pageTracker = _gat._getTracker(analayticsId);
            pageTracker._trackEvent(category, action);
        } catch (err) { }
    }

</script>

</head>
<body class="container" id="map-container">
  <!-- Prompt IE 6 users to install Chrome Frame. Remove this if you support IE 6.
       chromium.org/developers/how-tos/chrome-frame-getting-started -->
  <!--[if lt IE 7]><p class=chromeframe>Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->



<!-- NEW ####################################################### -->
<form id="form1" runat="server">
    <asp:ScriptManager ID="ScriptManager1" runat="server">
        <Services>                
            <asp:ServiceReference Path="ws/email.asmx" />
        </Services>
    </asp:ScriptManager>
<!-- NEW ####################################################### -->



    <header id="search-container" style="display:none;">
      <div id="topBannderForPrint" style="display:none;" class="print-only">
        <img src="img/top_banner_print.jpg" />
      </div>
      <div id="search">
        <a id="gmLogo" class="boxShadow" href="#">
          <img src="img/gmLogo.png" class="logo" id="logo">
        </a>
        <div id="headerMenu"  class="boxShadow">
          <img id="gmTagline" src="img/gmTagline.png" width="88" height="91">
          <ul id="menu" class="clearfix firstLoad">
            <li id="home-menu">
                <a href="#" id="home-select">
                  <img src="img/ozicon.png"/>
                </a>
            </li>   

            <li id="city-menu">
              <a class="dropdown-toggle" data-toggle="dropdown" id="city-crumb" href="">
                <span class="title">city</span> 
                city
                 <div class="menu-arrow">
                </div>
              </a>
             <div class="dropdown">
                <div class="dropdown-arrow">
                </div>
                <div  class="dropdown-menu">
                    <ul id="city-dropdown-menu">
                    </ul>
                </div>
              </div>
            </li>

            <li id="region-menu">
              <a class="dropdown-toggle" data-toggle="dropdown" id="region-crumb" href="">
                <span class="title">region</span>  
                region
                <div class="menu-arrow">
                </div>
              </a>
              <div class="dropdown">
                <div class="dropdown-arrow">
                </div>
                <div class="dropdown-menu">
                  <ul id="region-dropdown-menu">
                  </ul>
                </div>
              </div> 
            </li>
            
	       		<li id="subregion-menu">
              <a class="dropdown-toggle" data-toggle="dropdown" id="subregion-crumb" href="">
                <span class="title">suburb</span> 
                suburb
                 <div class="menu-arrow">
                </div>
              </a>
             <div class="dropdown">
                <div class="dropdown-arrow">
                </div>
                <div class="dropdown-menu" id="iscrollwrapper">
                  <ul id="subregion-dropdown-menu">
                  </ul>
                </div>
              </div> 
            </li>

            <li id="area-menu">
              <a class="dropdown-toggle filter" data-toggle="dropdown" id="area-crumb" href="">
                <span class="title">area size</span> 
                area size
                 <div class="menu-arrow">
                </div>
              </a>
               <div class="dropdown">
                <div class="dropdown-arrow">
                </div>
                <div class="dropdown-menu">
                  <ul id="area-dropdown-menu">
                  </ul>
               </div>
              </div> 
            </li>
			
            <li id="buildingtype-menu">
              <a class="dropdown-toggle filter" data-toggle="dropdown" id="buildingtype-crumb" href="">
                <span class="title">building type</span>
                building Type
                 <div class="menu-arrow">
                </div>
              </a>
              <div class="dropdown">
                <div class="dropdown-arrow">
                </div>
                <div class="dropdown-menu">
                  <ul id="buildingtype-dropdown-menu">
                  </ul>
                </div>
              </div>
            </li>
            <li class="compareListItem right">
              <a href="#" id="compare" title="My Properties">
                <span id="my-properties-count">4</span>
              </a>
              <div id="compareTooltipPanel">    
              <div class="tooltipArrow"></div>            
                    <div id="compareTooltipPanelContent" class="darkGrey boxShadow">
                      <span>My Properties</span>
                      To add a property to your 'My Properties' list, just click on the My Properties icon in the property details. The number in the icon below indicates how many properties you have selected. Then compare features between your chosen properties by clicking the icon.
                    </div>
                                
              </div>
            </li>
            <li class="right" id="testimonial-item">
              <a data-toggle="dropdown" href="#" id="testimonialItemIcon"  title="Testimonials">

              </a>
            </li>

          </ul>
          <div id="navTooltip">
            <div class="dropdown-arrow">
            </div>
            <div class="dropdown-arrow filter-arrow">
            </div>
            <div id="navTooltipContent" class="boxShadow darkGrey">
              <div id="navTooltipContentOptions" class="darkerGrey">
                <a id="close" class="close">
                  <img src="img/closeGrey.png" border="0" />
                </a>
              </div>
              <ul class="navTooltipContentList clearfix">
                <li>
                  <span>Start here:</span> 
                  To start using the Goodman Better Business tools, choose a city, region or suburb, or click on a location on the map below.
                </li>
                <li class="filter">
                  <span>Filter your results:</span> 
                  To narrow down your search results, choose an area size and/or building type.
                </li>
               <!--  <li>        <span></span>           </li> -->
              </ul>
            </div>
          </div>
        </div> 
      </div>
    </header>

  <section id="iphoneHeader" class="clearfix" style="display:none;">
    <a id="gmLogo" href="#">
      <img src="img/gmLogo.png" class="logo" id="logo">
    </a>
    <div id="iphoneHeaderMenu">
        <img id="gmTagline" src="img/gmTagline.png">
        <a id="mobileMenuToggle" > 
          Menu 
          <img src="img/mobileMenuToggleIcon.png" />
        </a>
        <a id="mobilePropertyDetails" style="display:none;" > 
          Property Details 
          <img src="img/mobileBackPropertyDetailsIcon.png" />
        </a>
    </div> 

  </section>  
 


<section role="main" id="mount">
<!-- IPHONE MENU -->
 <section id="iphoneMenuWrapper" >
    <div id="iphoneMenu">
    <ul class="darkestGrey clearfix">
      <li> <a id="location" class="darkGrey">location</a> 
          <ul id="menu-1-m" class="iphoneDropdown  clearfix">
              <li id="city-menu-m">
                <div class="options boxShadow">  
                  <h5 class="darkerGrey boxShadow">city</h5>
                  <div class="dropdown-menu">
                    <ul id="city-dropdown-menu-m">
                    </ul>
                  </div>
                </div>
              </li>

              <li id="region-menu-m">
                <div class="options boxShadow">

                  <h5 class="darkerGrey boxShadow">region</h5>
                  <div class="dropdown-menu">
                    <ul id="region-dropdown-menu-m">
                    </ul>
                  </div>
                </div> 
              </li>
              
              <li id="subregion-menu-m">
                <div class="options boxShadow">
                  <h5 class="darkerGrey boxShadow">Suburb</h5>
                  <div class="dropdown-menu" id="iscrollwrapper">
                    <ul id="subregion-dropdown-menu-m">
                    </ul>
                  </div>
                </div> 
              </li>
          </ul>
      </li>
      <li> <a id="filter" class="darkGrey">filters</a> 
        <ul id="menu-2-m" class="iphoneDropdown clearfix">
          <li id="area-menu-m" class="active">
            <div class="options boxShadow">
            <h5 class="darkerGrey boxShadow">area size</h5>
              <div class="dropdown-menu">
                <ul id="area-dropdown-menu-m">
                </ul>
             </div>
            </div> 
          </li>
          <li id="buildingtype-menu-m" class="active">
            <div class="options boxShadow">
              <h5 class="darkerGrey boxShadow">building type</h5>
              <div class="dropdown-menu">
                <ul id="buildingtype-dropdown-menu-m">
                </ul> 
              </div>
            </div>
          </li>
        </ul>
      </li>
      <li> <a href="#" class="darkGrey" id="aboutIphone">about</a> </li>
      <li> <a href="#"  class="darkGrey" id="contact">contact</a> </li>
    </ul>
  </div>
 </section>
<!-- END OF IPHONE MENU -->

 <!-- MY COMPARISON PANEL -->
    <div id="mycomparison-list-container" class="boxShadow" style="display:none;">
      <div id="mycomparison-list" class="comparison-list clearfix">
        <div class="comparison-listHeader darkGrey">
          <a href="#" id="close">
            <img src="img/closeGrey.png" border="0" />
          </a>
          
          <a href="" id="email-comparison-trigger" class="email-comparison-trigger" >
              <img src="img/email.png" border="0" />
          </a>
          <a href="#" id="clearall">clear all</a>
          <h2>my properties           
          </h2>
        </div>
        <div class="comparison-list-lhs">
            <div class="label">name</div>
            <div class="thumb-space"></div>
            <div class="label address">address</div>
            <div class="label description">overview</div>
            <div class="label area">size</div>
            <div class="label available">available</div>
            <div class="label amenities">amenities</div>
            <div class="label other">features</div>
            <div style="height:51px"></div>
        </div>
        <ul id="myitems-list"></ul>
      </div>
      <div id="email-comparison" class="gallery clearfix"></div>
    </div>
<!-- COMPARISON CONTAINER -->
    <div id="comparison-list-container" class="boxShadow" style="display:none;">
      <div id="comparison-list" class="comparison-list clearfix">
        <div class="comparison-listHeader darkGrey">
          <a href="#" id="close2">
            <img src="img/closeGrey.png" border="0" />
          </a>
          <h2>comparison table</h2>
        </div>
        <div class="comparison-list-lhs">
            <div class="label">name</div>
            <div style="height:120px"></div>
            <div class="label address">address</div>
            <div class="label description">overview</div>
            <div class="label area">size</div>
            <div class="label available">available</div>
            <div class="label amenities">amenities</div>
            <div class="label other">features</div>
            <div style="height:51px"></div>
        </div>
        <ul id="items-list"></ul>
      </div>
    </div>
<!-- CITY SELECT CONTAINER -->
    <div id="city-select-container" class="boxShadow darkerGrey clearfix" style="display:none;">
      <div class="citySelectContainerHeader boxShadow darkGrey">
      <a href="#" id="close">
        <img src="img/closeGrey.png" border="0" />
      </a>
        <h2>Put yourself in a better business position</h2>
      </div>

      <div class="citySelectContainerContent clearfix">

        <p class="bold">Search for warehouse and office space for lease across Goodman's extensive Australian property portfolio and put yourself in a better business position.</p>
        
        <!-- <iframe id="iframe" width="270" height="108" src="" frameborder="0" style="float:left;"></iframe> -->
        <p>Easy to use, interactive maps show surrounding local businesses, transport options, local amenities, and infrastructure - all of which are key considerations when choosing the most suitable location for your business.</p>

        <!--
        <a id="welcomeTestimonial" class="welcomeTestimonial" href="http://www.youtube.com/embed/X2feLK60PTs?rel=0&wmode=transparent" onclick="recordOutboundLink(this, 'welcomeTestimonialVideo', this.href);return true;"  rel="welcomeTestimonial">
          <img src="img/welcomeTestimonial.jpg" width="180" border="0" />
          <p style="text-decoration:none;color:White;">test</p>
        </a>
        -->
        <ul class="welcomeTestimonial-list darkestGrey" id="welcome-testimonial-list">
          <li><img src="img/welcomeSlider/slide0.jpg" ></li>
          <li><img src="img/welcomeSlider/slide1.jpg" ></li>
          <li><img src="img/welcomeSlider/slide2.jpg" ></li>
          <li><img src="img/welcomeSlider/slide3.jpg" ></li>
          <li><img src="img/welcomeSlider/slide4.jpg" ></li>
          <li><img src="img/welcomeSlider/slide5.jpg" ></li>
          <li><img src="img/welcomeSlider/slide6.jpg" ></li>
          <li><img src="img/welcomeSlider/slide7.jpg" ></li>
          <li><img src="img/welcomeSlider/slide8.jpg" ></li>
          <li><img src="img/welcomeSlider/slide9.jpg" ></li>
        </ul>

        <p>Additional features enable you to calculate the distance and route to relevant locations, infrastructure and businesses. You can also bookmark properties of interest, compare their key features and email details to a friend.</p>
        <a id="getStartedButton" class="boxShadow">
          Start your search
        </a>       
      </div>
    </div>
<!-- PROPERTY LIST CONTAINER -->
    <div id="property-list-container" style="display:none;" class="boxShadow">
        <h4 id="property-list-title">Properties for lease in this area</h4>   <!-- ADD COUNTER FOR THE NUMBER OF PROPERTIES -->
        <ul id="property-list" class="clearfix"></ul>
        <h4 id="featured-list-title" >You may also be interested in</h4>
        <ul id="featured-list"></ul>
    </div>
<!-- TESTIMONIAL LIST CONTAINER -->
    <div id="testimonial-list-container" style="display:none;" class="boxShadow darkerGrey">
        <h4 class="darkGrey boxShadow">What our customers say</h4>
        <div style="position:relative">
            <ul class="testimonial-list darkerGrey" id="testimonial-list"></ul>
        <div id="testimonial-nav">
          <div id="prevSlide"></div>
          <div id="nextSlide"></div>
        </div>
      </div>
    </div>
<!-- PROPERTY INFO CONTAINER -->
    <div id="property-info-container" class="boxShadow"  style="display:none;">
        <div id="property-info" class="clearfix darkGrey"></div>
        <div id="gallery" class="darkerGrey clearfix"></div>
        <div id="email-property" class="gallery clearfix"></div>
    </div>
<!-- TESTIMONIALITEM CONTAINER -->
    <div id="testimonialItem-container" class="boxShadow  darkerGrey"  style="display:none;">
        <div id="testimonialItem" class="testimonialItem clearfix"></div>
    </div>
<!-- GOODMAN PLACE INFO -->
    <div id="goodman-place-info-container" class="boxShadow darkGrey"  style="display:none;">
        <div id="goodman-place-info"  class="placePins"></div>
    </div>
<!-- GOOGLE PLACE INFO -->
    <div id="google-place-info-container" class="boxShadow darkGrey"  style="display:none;">
        <div id="google-place-info" class="placePins"></div>
    </div>
<!-- TRAFFIC CAMERA -->
    <div id="rtacam-place-info-container" class="boxShadow darkGrey"  style="display:none;">
        <div id="rtacam-place-info">

        </div>
    </div>
<!-- ROUTE CONTAINER -->
    <div id="route-info-container" class="boxShadow" style="display:none;">
        <div id="route-info">

        </div>
    </div>
<!-- CONTACT US CONTAINER -->
    <div id="contact-us-container" class="boxShadow"  style="display:none;">
        <div id="contact-us"></div>
    </div>
<!-- ABOUT CONTAINER -->
	<div id="about-container" class="boxShadow darkerGrey" style="display:none;">
      <div id="about" class="about clearfix"></div>
    </div>
<!-- LEFT PANEL - TOOLBAR -->
      <div id="place-controls-container" style="display:none;" class="boxShadow">
        <div id="place-controls">
          <ul class="darkGreyList">
            <li class="controller button-style transportWhiteIcon" id="transport" >transport
            </li>  
            <li class="controller button-style utilitiesWhiteIcon" id="utilities" >utilities
            </li>
            <li class="controller button-style foodWhiteIcon" id="food" >food
            </li>
            <li class="controller button-style leisureWhiteIcon" id="leisure" >leisure
            </li>
            <li class="controller button-style shoppingWhiteIcon" id="shopping" >local business
            </li>
            <li class="controller button-style trafficCamerasWhiteIcon" id="trafficCameras" >traffic cameras
            </li>
          </ul>
          <div id="placesTooltip">
            <div class="placesTooltipWrapper">
              <div class="tooltipArrow"></div>
              <div class="">

                <div class="placesTooltipContent darkGrey boxShadow">
                    <span>Toolbar</span>
                    To filter the amenities in the suburb you've chosen, click on one of the categories in the Better Business tool bar. Clicking on the relevant icon will turn them on and off. When the label is white that category is currently active - click on the icon to remove from the map. 
                </div>
              </div>
            </div>
          </div>          
        </div>
      </div>
</section> 
 
  <section id="map-canvas"></section>

  <footer id="footer-container" class="hidden boxShadow">
      <div style="position:relative;">
        <section id="mapNavigation" class="darkerGrey boxShadow">
          <ul class="clearfix">
            <li>
              <ul id="wheelMapNavigaton">
                <li>
                  <a id="northButton"></a>
                </li>
                <li class="clearfix">
                  <a id="westButton"></a>
                  <a id="eastButton"></a>
                </li>
                <li>
                  <a id="southButton"></a>
                </li>
              </ul>
            </li>
            <li>
              <ul id="zoomMapNavigation">
                <li>
                  <a id="zoomInButton"></a>
                </li>
                <li>
                  <a id="zoomOutButton" ></a>
                </li>
              </ul>  
            </li>
          </ul>
        </section>

      <ul id="footer" class="clearfix">
        <li id="about-menu" class="menu">
          <a data-toggle="dropdown" href="#">about</a>
        </li>
        <li id="contact-menu" class="menu">
          <a data-toggle="dropdown" href="#">contact</a>
        </li>
        <li class="ad clearfix">
            <a href="http://www.dexionsevenhills.com.au" onclick="recordOutboundLink(this, 'Ads', this.href);return true;" target="_blank">
            <img src="img/ad1.png" class="adImage"/>
              <h4 class="adTitle">Dexion Seven Hills</h4>
            <p class="adCopy">Industrial and commercial<br/>
            storage systems.</p>
            </a>
        </li>
        <li class="ad clearfix">
            <a href="http://www.sheldon.com.au/index.html" onclick="recordOutboundLink(this, 'Ads', this.href);return true;" target="_blank">
            <img src="img/ad2.png" class="adImage"/>
              <h4 class="adTitle">Sheldon</h4>
            <p class="adCopy">Design | Project Manage |<br />Manufacture</p>
            </a>
        </li>
      </ul>
    </div>
  </footer>

<!-- NEW ####################################################### -->
</form>
<!-- NEW ####################################################### -->


  <!-- JavaScript at the bottom for fast page loading -->

  <!-- Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if offline -->
  
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
  <script>      window.jQuery || document.write('<script src="js/libs/jquery-1.7.2.min.js"><\/script>')</script>

  <!-- <script src="js/libs/jquery-1.7.2.js"></script> -->

  <script src="js/jquery.tmpl.min.js" type="text/javascript" ></script>
  
  <!-- Twitter bootstrap - for multi-platform apps 
  See http://twitter.github.com/bootstrap/#overview 
    <script src="js/bootstrap.min.js"></script> -->
  
  <!-- backbone.js is dependent on underscore.js -->
    <script src="js/underscore.min.js"></script>
  
  <!-- Backbone.js gives structure to web applications by providing models with key-value binding and custom events, collections with a rich 
  API of enumerable functions, views with declarative event handling, and connects it all to your existing API over a RESTful JSON interface. 
  See http://documentcloud.github.com/backbone/# -->
    <script src="js/backbone-min.js"></script>
  
  <!--backbone-localstorage.js - No updates are made to a remote database. The only data that is persisted is property data used for comparison 
  purposes, in local storage. backbone-localstorage.js is used for this - it overrides backbone's normal fetch() and save() operations.
  See http://documentcloud.github.com/backbone/docs/todos.html -->
    <!-- <script src="js/backbone-localstorage.js"></script> -->
    <!-- amplify - http://stackoverflow.com/questions/6946700/whats-best-practice-for-using-backbone-js-with-localstorage-for-ie7-and-ie6 -->
    
    
    <script src="js/json2.js"></script>
    <script src="js/amplify.store.js"></script>
    <script src="js/backbone.amplify.js"></script>
    

    <!-- https://github.com/jhudson8/backbone-query-parameters -->
    <script src="js/backbone.queryparams.js"></script>
  
  <!-- Google maps -->
    <!-- Dev URL - <script src="http://maps.googleapis.com/maps/api/js?sensor=false&libraries=places&key=AIzaSyBSNcyh8J_WdlbgbHulcFUy1PwX_3Ou7Jc" type="text/javascript" ></script> -->
    <!-- Live URL - Google Maps API for Business URL <script src="http://maps.googleapis.com/maps/api/js?libraries=places&client=gme-totemcommunications&sensor=false&v=3.3&signature=VsUyFh5h2lZ5MoFGhKQYDwAZ1uE=" type="text/javascript" ></script> -->
    <!-- <script src="http://maps.googleapis.com/maps/api/js?sensor=false&v=3.3&libraries=places&key=AIzaSyBSNcyh8J_WdlbgbHulcFUy1PwX_3Ou7Jc" type="text/javascript" ></script> -->

	<script src="http://maps.googleapis.com/maps/api/js?libraries=places&client=gme-totemcommunications&sensor=false&v=3.3&signature=VsUyFh5h2lZ5MoFGhKQYDwAZ1uE=" type="text/javascript" ></script>


  <!-- Needed for the Visualization API (custom places) -->
  <!--  <script src="http://www.google.com/jsapi" type="text/javascript" ></script> -->
  

  <!-- Goodman Better Business application -->

    <script src="js/gbb.min.js?key=20130111" type="text/javascript" ></script>

    <script src="js/gbb-map-styles.js" type="text/javascript" ></script>
    <script src="js/http.js" type="text/javascript" ></script>

<!-- LIGHTBOX PLUGIN -->
<script type="text/javascript" src="js/jquery.colorbox-min.js"></script>
<script type="text/javascript" src="js/cycle.all.min.js"></script>

<!-- Media query shim for IE<8 https://code.google.com/p/css3-mediaqueries-js/ -->
<script type="text/javascript" src="js/css3-mediaqueries.js"></script>

  <!-- scripts concatenated and minified via build script -->
  <!--  <script src="js/plugins.js"></script> -->
  <!--  <script src="js/script.js"></script> -->
  <!-- end scripts -->

</body>
</html>