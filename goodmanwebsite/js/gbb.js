/************************************************************************************************************************************************************
- "GBB" is the namespace of the Goodman Better Business application.
- All variables and functions will be placed in GBB to avoid clashes with other namespaces and other global objects.
- init() - called once the page is loaded. 
*************************************************************************************************************************************************************/

/*jslint browser: true, plusplus: true */
/*global Backbone,$,Store,console: false,google */

/* required settings */
var _isDebug = true;            /* show the log info only for debugging */
var _basePage = 'index.aspx';   /* index.aspx for prod, index.html for dev */
var _maxRouteDistance = 80;     /* maximum distance for routes: in km */

/* enable local json when server-side functionality is done */
var _localPropertyJSON = _activeProperties; /* local json for property feeds */
var _localBBXtrasJSON = _BBXtras;  /* local json for extra */

if (!_isDebug && !window.console) console = { log: function () { } };
// This function is an all-purpose //console.logging mechanism
function logCallee(context) {

    //display only for debugging
    if (_isDebug) {

        var i, myName;

        if ((typeof context) === "string") {
            console.log(context);
        } else {
            myName = context.callee.toString();
            myName = myName.substr('function '.length);
            myName = myName.substr(0, myName.indexOf('('));

            console.log(myName);

            for (i = arguments.length - 1; i >= 0; i--) {
                console.log(arguments[i]);
            }
        }
    }
}

var GBB = new function () {

    //The following is only needed for custom Goodman places
    //google.load('visualization', '1');

    "use strict";

    // Here is where we declare all the variables for the GBB application:
    var GBB = this,
        cities,
        regions,
        subregions,
        areas,
        buildingtypes,
        properties,
        regionPins = [],
        placePins = [],
        propertyPins = [],
        goodmanPlaces,
        rtaPlaces,
        bbxtras,
        customerPodTestimonials,
        testimonialPodTestimonials,
        staffPodTestimonials,
        allPodTestimonials,
        querystring = [],
        initialRoute = "",
        fromClickEvent = false,
        firstRouteEvent = true,
        isTouch = false,
        firstSubregionRouteEvent = true,
        firstEventForSession = true,
        is_chrome,
        is_explorer,
        is_firefox,
        is_safari,
        is_Opera,
        lastAreaName = '2,501+ sqm',    /* text to be used as the last area search label */
    /******************************************************************************************************************
    - A lot of the objects in the GBB app are represented by Backbone.Model, Backbone.View and Backbone.Collection
    objects.
    - These 3 special objects provide a tidy MVC famework. Among the functions they provide:
    - Backbone.Collection - Feed the constructor a JSON array and it will return the corresponding array of 
    javascript objects.
    - Backbone.Collections also provide handy methods for filtering and sorting the javascript objects.
    - Backbone.Views can be linked to a template, a model, and a DOM object. 
    - Backbone.Views also provide a "render" function. Fine-grained adjustment of the view can be performed here.
    *******************************************************************************************************************/
        AreaDDItem = Backbone.Model.extend({}),
        BuildingTypeDDItem = Backbone.Model.extend({}),
        AreaDDItems = Backbone.Collection.extend({
            model: AreaDDItem,
            comparator: function (item) { return item.get("id"); },
            initialize: function () { },
            areasByName: function (name) { return this.filter(function (area) { return area.get('AreaName') === name; }); }
        }),
        BuildingTypeDDItems = Backbone.Collection.extend({
            model: BuildingTypeDDItem,
            comparator: function (item) { return item.get("id"); },
            initialize: function () { },
            buildingTypesByName: function (name) { return this.filter(function (buildingType) { return buildingType.get('BuildingTypeName') === name; }); }
        }),
        CityDDListView = Backbone.View.extend({
            el: $('#city-dropdown-menu'),
            template: $('#city-dropdown-menu-item-tmpl').template(),
            render: function () { $('#city-dropdown-menu').empty(); $.tmpl(this.template, this.model.toArray()).appendTo(this.el); return this; }
        }),
        RegionDDListView = Backbone.View.extend({
            el: $('#region-dropdown-menu'),
            template: $('#region-dropdown-menu-item-tmpl').template(),
            render: function () { $('#region-dropdown-menu').empty(); $.tmpl(this.template, this.model.toArray()).appendTo(this.el); return this; }
        }),
        SubregionDDListView = Backbone.View.extend({
            el: $('#subregion-dropdown-menu'),
            template: $('#subregion-dropdown-menu-item-tmpl').template(),
            render: function () { $('#subregion-dropdown-menu').empty(); $.tmpl(this.template, this.model.toArray()).appendTo(this.el); return this; }
        }),
        AreaDDListView = Backbone.View.extend({
            el: $('#area-dropdown-menu'),
            template: $('#area-dropdown-menu-item-tmpl').template(),
            render: function () {
                $('#area-dropdown-menu').empty();

                // modify the list of area
                //var areas = this.model.toArray();
                //var modifiedAreas = [];
                //for(var i=0; i<areas.length; i++) {
                //    logCallee('area name = '+ areas[i].attributes.AreaName);
                //    if(areas[i].attributes.AreaName != '2,501 to 5,000 sqm') {
                //        modifiedAreas.push(areas[i]);
                //    }
                //    else {
                //        var lastArea = areas[i];
                //        lastArea.attributes.AreaName = '2,501+ sqm';
                //        modifiedAreas.push(lastArea);
                //        break;
                //    }
                //}
                //$.tmpl(this.template, modifiedAreas).appendTo(this.el);
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);
                return this;
            }
        }),
        BuildingTypeDDListView = Backbone.View.extend({
            el: $('#buildingtype-dropdown-menu'),
            template: $('#buildingtype-dropdown-menu-item-tmpl').template(),
            render: function () {
                $('#buildingtype-dropdown-menu').empty();

                // remove Developments from the drop
                //var buildingTypes = $.grep(this.model.toArray(), function(n) { return n.attributes.BuildingTypeName != 'Developments'; });
                //$.tmpl(this.template, buildingTypes).appendTo(this.el);
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);
                return this;
            }
        }),
        CityDDListViewM = Backbone.View.extend({
            el: $('#city-dropdown-menu-m'),
            template: $('#city-dropdown-menu-item-tmpl').template(),
            render: function () {
                $('#city-dropdown-menu-m').empty();
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);
                return this;
            }
        }),
        RegionDDListViewM = Backbone.View.extend({
            el: $('#region-dropdown-menu-m'),
            template: $('#region-dropdown-menu-item-tmpl').template(),
            render: function () {
                $('#region-dropdown-menu-m').empty();
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);
                return this;
            }
        }),
        SubregionDDListViewM = Backbone.View.extend({
            el: $('#subregion-dropdown-menu-m'),
            template: $('#subregion-dropdown-menu-item-tmpl').template(),
            render: function () {
                $('#subregion-dropdown-menu-m').empty();
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);
                return this;
            }
        }),
        AreaDDListViewM = Backbone.View.extend({
            el: $('#area-dropdown-menu-m'),
            template: $('#area-dropdown-menu-item-tmpl').template(),
            render: function () {
                $('#area-dropdown-menu-m').empty();
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);
                return this;
            }
        }),
        BuildingTypeDDListViewM = Backbone.View.extend({
            el: $('#buildingtype-dropdown-menu-m'),
            template: $('#buildingtype-dropdown-menu-item-tmpl').template(),
            render: function () {
                $('#buildingtype-dropdown-menu-m').empty();
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);
                return this;
            }
        }),
        Testimonial = Backbone.Model.extend({}),
        Testimonials = Backbone.Collection.extend({
            model: Testimonial,
            comparator: function (item) { return item.get("id"); },
            initialize: function () { }
        }),
        GoodmanPlace = Backbone.Model.extend({}),
        GoodmanPlaces = Backbone.Collection.extend({
            model: GoodmanPlace,
            comparator: function (item) { return item.get("id"); },
            initialize: function () { },
            GoodmanPlacesByType: function (name) {
                return this.filter(function (goodmanPlace) { return goodmanPlace.get('type') === name; });
            }
        }),
        RtaPlace = Backbone.Model.extend({}),
        RtaPlaces = Backbone.Collection.extend({
            model: RtaPlace,
            comparator: function (item) { return item.get("id"); },
            initialize: function () { },
            RtaPlacesByType: function (name) { return this.filter(function (rtaPlace) { return rtaPlace.get('type') === name; }); }
        }),
        Property = Backbone.Model.extend({ defaults: {}, url: function () { } }),
        BBXtra = Backbone.Model.extend({ defaults: {}, url: function () { } }),
        Region = Backbone.Model.extend({}),
        Subregion = Backbone.Model.extend({}),
        City = Backbone.Model.extend({}),
        Properties = Backbone.Collection.extend({
            model: Property,
            comparator: function (item) { return item.get("id"); },
            initialize: function () { },
            propertiesBySubregion: function (subregion) { return this.filter(function (property) { return property.get('SubRegion') === subregion; }); },
            propertiesByRegion: function (region) { return this.filter(function (property) { return property.get('Region') === region; }); },
            propertiesByCity: function (city) { return this.filter(function (property) { return property.get('City') === city; }); },
            propertiesById: function (id) { return this.filter(function (property) { return property.get('id') === id; }); },
            propertiesByPropertyName: function (propertyname) { return this.filter(function (property) { return property.get('PropertyName') === propertyname; }); },
            propertiesByDisplayName: function (displayname) { return this.filter(function (property) { return property.get('DisplayName') === displayname; }); },
            propertiesByArea: function (area) { return this.filter(function (property) { return property.get('Area') === area; }); },
            propertiesByBuildingType: function (buildingType) { return this.filter(function (property) { return property.get('PropertyType') === buildingType; }); }
        }),
        BBXtras = Backbone.Collection.extend({
            model: BBXtra,
            comparator: function (item) { return item.get("id"); },
            initialize: function () { },
            bbxtrasByTitle: function (title) { return this.filter(function (bbxtra) { return bbxtra.get('Title') === title; }); },
            bbxtrasByTypePrimary: function (typeprimary) { return this.filter(function (bbxtra) { return bbxtra.get('TypePrimary') === typeprimary; }); },
            bbxtrasByTypeSecondary: function (typesecondary) { return this.filter(function (bbxtra) { return bbxtra.get('TypeSecondary') === typesecondary; }); },
            bbxtrasByTypeTertiary: function (typetertiary) { return this.filter(function (bbxtra) { return bbxtra.get('TypeTertiary') === typetertiary; }); },
            bbxtrasByPrimarySecondary: function (typeprimary, typesecondary) { return this.filter(function (bbxtra) { return (bbxtra.get('TypePrimary') === typeprimary) && (bbxtra.get('TypeSecondary') === typesecondary); }); }
        }),
        Regions = Backbone.Collection.extend({
            model: Region,
            comparator: function (item) { return item.get("Region"); },
            initialize: function () { },
            regionsByCity: function (city) { return this.filter(function (region) { return region.get('City') === city; }); },
            regionsByName: function (regionName) { return this.filter(function (region) { return region.get('Region') === regionName; }); }
        }),
        Subregions = Backbone.Collection.extend({
            model: Subregion,
            comparator: function (item) { return item.get("SubRegion"); },
            initialize: function () { },
            subregionsByCity: function (city) { return this.filter(function (subregion) { return subregion.get('City') === city; }); },
            subregionsByRegion: function (region) { return this.filter(function (subregion) { return subregion.get('Region') === region; }); },
            subregionsByName: function (subregionName) { return this.filter(function (subregion) { return subregion.get('SubRegion') === subregionName; }); }
        }),
        Cities = Backbone.Collection.extend({
            model: City,
            comparator: function (item) { return item.get("City"); },
            initialize: function () { },
            citiesByName: function (cityName) { return this.filter(function (city) { return city.get('City') === cityName; }); }
        }),
        PropertyInfoView = Backbone.View.extend({
            el: $('#property-info'),
            template: $('#property-info-tmpl').template(),
            render: function () {

                $('#property-info').empty();
                $.tmpl(this.template, this.model).appendTo(this.el);

                // We need to adjust the *Description fields - currently the contents will render <html> tags.
                // We prevent this by feeding the *Description content into a jquery html object, and using the object's innerText as the final content to be displayed.

                // display dateAvailable if provided
                var dateAvailable = getDateAvailableSnippet(this.model);
                if (dateAvailable) {
                    $('.propertyContent #propertyInfoDateAvailable span').html(dateAvailable);
                    $('.propertyContent #propertyInfoDateAvailable').show();
                }
                else {
                    $('.propertyContent #propertyInfoDateAvailable').hide();
                }

                // get getOtherSnippet -> changed to drop this and display only the detailed description
                //var otherSnippet = getOtherSnippet(this.model);
                //if(otherSnippet)
                //    otherSnippet = '<ul class="propertyInfoOtherSnippet">' + otherSnippet + '</ul>';

                // get detaildDescription
                logCallee("???????????????????????? " + this.model.DetailedDescription);
                var tmp = document.createElement("DIV");
                tmp.innerHTML = this.model.DetailedDescription.replace('\r\n      ', '');
                var detailedDesc = tmp.textContent || tmp.innerText;

                //if (($.browser.msie) && (parseInt($.browser.version, 10) === 8)) {
                //   // See: "$.text() doesn't work on IE8 (it was stripping out whitespace in the pdf filenames) so we use the following hack)"
                //    // ... this is the 2nd part of the hack. We need to do some extra data cleansing for IE8
                //    tmp = document.createElement("DIV");
                //    tmp.innerHTML = detailedDesc;
                //    detailedDesc = tmp.textContent || tmp.innerText;
                //}

                // get overview part of description
                // if ul tag is not found, use the detailed description as the overview
                var overview = '';
                var description = detailedDesc.replace('\r', '').replace('\n', '').trim();
                var ulPos = description.indexOf('<ul>');
                var tablePos = description.indexOf('<table');
                var pos = ulPos < tablePos ? (ulPos < 0 ? tablePos : ulPos) : (tablePos < 0 ? ulPos : tablePos);
                if (pos > 0) {
                    overview = description.substr(0, pos);
                    description = description.substr(pos, description.length - pos);

                    // if DetailedDescription has both overview and ul, overview should have p tag
                    //if(overview.indexOf('<p>') == -1)
                    //    overview = this.model.BriefDescription;
                }
                else if (pos < 0) {
                    // if no bullet and table, use the whole detaild description as overview
                    overview = description;
                    description = '';
                }

                // remove the empty space from overview and check again
                /* TODO: this doesn't work becuase of IE8... so diable it for now
                $('<div>')
                .attr('id', 'tempOverviewDiv')
                .html($.trim(overview))
                .hide()
                .appendTo('body');
                $('body > div#tempOverviewDiv > p').each(function() { $(this).text($(this).text().trim()); });
                $('body > div#tempOverviewDiv > p:empty').remove();
                overview = $('body > div#tempOverviewDiv').html().trim();
                $('body > div#tempOverviewDiv').remove(); */

                // filter unwanted words
                //var _unwantedWords = ['Features</p>', 'features</p>', 'Features;</p>', 'features;</p>', 'Features:</p>', 'features:</p>'];
                //for(var i=0; i<_unwantedWords.length; i++) {
                //    overview = overview.replace(_unwantedWords[i], '</p>');
                //}

                tmp = document.createElement("DIV");
                tmp.innerHTML = overview && overview != 'undefined' ? overview : this.model.BriefDescription;
                overview = tmp.textContent || tmp.innerText;
                $("#DetailedDescriptionAdjusted").html('<p class="description-sub-heading print-only">Overview</p>' + overview);

                // if feature tab is not provided, hide tabs
                //if(otherSnippet || description) {
                if (description) {
                    //$("#DetailedDescriptionFeatures").html(description + otherSnippet);
                    $("#DetailedDescriptionFeatures").attr('class', $("#DetailedDescriptionFeatures").attr('class') + ' features-included').html('<p class="description-sub-heading print-only">Features</p>' + description);

                    //if(!description)
                    //    $('#property-info .propertyContent .propertyDescriptionContainer ul').css('margin-bottom', '0');
                }
                else {
                    $('.propertyDescriptionContainer .description-tabs').hide();
                    $('#property-info .propertyContent .propertyDescriptionContainer .propertyDescription').css('border-top', 'none');
                }

                // remove empty p tabs
                var paras = $('#DetailedDescriptionFeatures p');
                for (var i = 0; i < paras.length; i++) {
                    if (!$.trim(paras[i].innerHTML.replace('\n', '').replace('<br>', '')))
                        $("#DetailedDescriptionFeatures").html($("#DetailedDescriptionFeatures").html().replace(paras[i].outerHTML, ''));
                }

                $('#propertyDescriptionTabOverview').bind('click', function () {
                    $('#propertyDescriptionTabOverview').attr('class', 'active-tab');
                    $('#propertyDescriptionTabFeatures').attr('class', 'inactive-tab');
                    $("#DetailedDescriptionAdjusted").show();
                    $("#DetailedDescriptionFeatures").hide();
                });
                $('#propertyDescriptionTabFeatures').bind('click', function () {
                    $('#propertyDescriptionTabOverview').attr('class', 'inactive-tab');
                    $('#propertyDescriptionTabFeatures').attr('class', 'active-tab');
                    $("#DetailedDescriptionAdjusted").hide();
                    $("#DetailedDescriptionFeatures").show();
                });

                // handle amenity list
                displayAmenity(this.model.Amenities, '#propertyAmentityContainer')

                // make phone number clickable only for mobile devices
                var phone = this.model.Contact1.split(",")[2];
                logCallee('isMobile = ' + isMobile.any());
                logCallee('navigator.userAgent = ' + navigator.userAgent);
                if (isMobile.any()) {
                    $('<a>')
                        .attr({ href: 'tel:' + phone })
                        .attr('class', 'phone-number')
                        .bind('click', function () {
                            _gaq.push(['_trackEvent', 'call phone number click', 'clicked']);
                        })
                        .appendTo('span.propertyAgentContact').html(phone); // IE doesnt like class so got ugly
                }
                else {
                    $('span.propertyAgentContact').html(phone);
                }

                $('#propertyInfoPrintDetailPanel p').filter(function () {
                    return $.trim($(this).text()) === '' && $(this).children().length == 0
                }).remove();

                return this;
            }
        }),
        GooglePlaceInfoView = Backbone.View.extend({
            el: $('#google-place-info'),
            template: $('#google-place-info-tmpl').template(),
            render: function () {
                $('#google-place-info').empty();
                $('#google-place-info').removeClass();
                $('#google-place-info').addClass("placePins");
                $('#google-place-info').addClass(this.model.type);
                $.tmpl(this.template, this.model).appendTo(this.el);
                return this;
            }
        }),
        ContactUsView = Backbone.View.extend({
            el: $('#contact-us'),
            template: $('#contact-us-tmpl').template(),
            render: function () { $('#contact-us').empty(); $.tmpl(this.template, this.model).appendTo(this.el); return this; }
        }),
        TestimonialItemView = Backbone.View.extend({
            el: $('#testimonialItem'),
            template: $('#testimonialItem-tmpl').template(),
            render: function () {

                $('#testimonialItem').empty();
                $.tmpl(this.template, this.model).appendTo(this.el);

                var html = "";
                for (var i = 0; i < testimonialPodTestimonials.length; i++) {
                    //html += "<li><a href='" + $.trim(CarouselImagesArray[i]) + "' rel='lightbox' class='photo'><img src='" + $.trim(CarouselImagesArray[i]) + "' /></a></li>";
                    html += "<li class='testimonialItem'>";
                    html += "<a id='testimonial_" + testimonialPodTestimonials.models[i].attributes.id + "' href='http://www.youtube.com/embed/" + testimonialPodTestimonials.models[i].attributes.url + "?rel=0&wmode=transparent' rel='testimonialListVideo' class='testimonialListVideo'>";
                    html += "<div style='background:url(http://i2.ytimg.com/vi/" + testimonialPodTestimonials.models[i].attributes.url + "/default.jpg) center center no-repeat;height: 76px;background-size: 100%;'></div>";
                    html += "<p>" + testimonialPodTestimonials.models[i].attributes.blurb + "</p>";
                    html += "</a>";
                    html += "</li>";
                }
                $("#testimonialItemContentList2").html(html);

                var html = "";
                for (var i = 0; i < staffPodTestimonials.length; i++) {
                    html += "<li class='testimonialItem'>";
                    html += "<a id='testimonial_" + staffPodTestimonials.models[i].attributes.id + "' href='http://www.youtube.com/embed/" + staffPodTestimonials.models[i].attributes.url + "?rel=0&wmode=transparent' rel='testimonialListVideo' class='testimonialListVideo'>";

                    //This is a hack just for Sydney West - they didn't like the default photo.
                    if (staffPodTestimonials.models[i].attributes.url === "ZkOy2ow4S5k") {
                        html += "<div style='background:url(img/sydneyWest.jpg) center center no-repeat;height: 76px;background-size: 100%;'></div>";
                    }
                    else {
                        html += "<div style='background:url(http://i2.ytimg.com/vi/" + staffPodTestimonials.models[i].attributes.url + "/default.jpg) center center no-repeat;height: 76px;background-size: 100%;'></div>";
                    }

                    html += "<p>" + staffPodTestimonials.models[i].attributes.blurb + "</p>";
                    html += "</a>";
                    html += "</li>";
                }
                $("#testimonialItemContentList").html(html);

                var testimonialItemHandler;
                testimonialItemHandler = function (event) {
                    logCallee("testimonialPodTestimonials video clicked " + this.href);
                    event.preventDefault();
                };
                $("#testimonialItem li a").bind("click", testimonialItemHandler);

                // get the height right
                setEvenHeight($('#testimonialItemContentList li'));
                setEvenHeight($('#testimonialItemContentList2 li'));

                //$('#testimonialItem .testimonialItemContent').scrollTop();

                return this;
            }
        }),
        AboutView = Backbone.View.extend({
            el: $('#about'),
            template: $('#about-tmpl').template(),
            render: function () {

                $('#about').empty();
                $.tmpl(this.template, this.model).appendTo(this.el);

                var decoded, tmp;

                // Content in the Goodman CMS is stored as "character-escaped" HTML. The following hack converts the tags:
                tmp = document.createElement("DIV");
                tmp.innerHTML = this.model.mainBlurb;
                decoded = tmp.textContent || tmp.innerText;

                $("#aboutBlurb").html(decoded);

                //tmp = document.createElement("DIV");
                //tmp.innerHTML = decoded;
                //this.model.mainBlurb = tmp.textContent || tmp.innerText;

                return this;
            }
        }),
        GalleryView = Backbone.View.extend({
            el: $('#gallery'),
            template: $('#gallery-tmpl').template(),
            render: function () { $('#gallery').empty(); $.tmpl(this.template, this.model).appendTo(this.el); return this; }
        }),
        EmailPropertyView = Backbone.View.extend({
            el: $('#email-property'),
            template: $('#email-property-tmpl').template(),
            render: function () { $('#email-property').empty(); $.tmpl(this.template, this.model).appendTo(this.el); return this; }
        }),
        EmailComparisonView = Backbone.View.extend({
            el: $('#email-comparison'),
            template: $('#email-comparison-tmpl').template(),
            render: function () { $('#email-comparison').empty(); $.tmpl(this.template, this.model).appendTo(this.el); return this; }
        }),
        GoodmanPlaceInfoView = Backbone.View.extend({
            el: $('#goodman-place-info'),
            template: $('#goodman-place-info-tmpl').template(),
            render: function () { $('#goodman-place-info').empty(); $.tmpl(this.template, this.model).appendTo(this.el); return this; }
        }),
        RtacamPlaceInfoView = Backbone.View.extend({
            el: $('#rtacam-place-info'),
            template: $('#rtacam-place-info-tmpl').template(),
            render: function () { $('#rtacam-place-info').empty(); $.tmpl(this.template, this.model).appendTo(this.el); return this; }
        }),
        RouteInfoView = Backbone.View.extend({
            el: $('#route-info'),
            template: $('#route-info-tmpl').template(),
            render: function () { $('#route-info').empty(); $.tmpl(this.template, this.model).appendTo(this.el); return this; }
        }),
        PropertyListView = Backbone.View.extend({
            el: $('#property-list'),
            template: $('#property-list-item-tmpl').template(),
            render: function () { $('#property-list').empty(); $.tmpl(this.template, this.model.toArray()).appendTo(this.el); return this; }
        }),
        TestimonialListView = Backbone.View.extend({
            el: $('#testimonial-list'),
            template: $('#testimonial-list-item-tmpl').template(),
            render: function () { $('#testimonial-list').empty(); $.tmpl(this.template, this.model.toArray()).appendTo(this.el); return this; }
        }),
        FeaturedListView = Backbone.View.extend({
            el: $('#featured-list'),
            template: $('#featured-list-item-tmpl').template(),
            render: function () { $('#featured-list').empty(); $.tmpl(this.template, this.model.toArray()).appendTo(this.el); return this; }
        }),
        CitySelectView = Backbone.View.extend({
            el: $('#city-select-menu'),
            template: $('#city-select-item-tmpl').template(),
            render: function () {
                $('#city-select-menu').empty();
                $.tmpl(this.template, this.model.toArray()).appendTo(this.el);

                // var html = "";
                // for (var i = 0; i < allPodTestimonials.length; i++) {
                //     html += "<li class='testimonialItem'>";
                //     html += "<a id='testimonial_" + allPodTestimonials[i].id + "' href='' rel='testimonialListVideo' class='testimonialListVideo'>";

                //     //This is a hack just for Sydney West - they didn't like the default photo.
                //     if (allPodTestimonials[i].url === "ZkOy2ow4S5k") {
                //         html += "<div style='background:url(img/sydneyWest.jpg) center center no-repeat;height: 70px;background-size: 100%;'></div>";
                //     }
                //     else {
                //         html += "<div style='background:url(http://i2.ytimg.com/vi/" + allPodTestimonials[i].url + "/default.jpg) center center no-repeat;height: 70px;background-size: 100%;'></div>";
                //     }

                //     html += "<p>" + allPodTestimonials[i].blurb + "</p>";
                //     html += "</a>";
                //     html += "</li>";
                // }
                // $("#welcome-testimonial-list").html(html);

                return this;
            }
        }),
        myComparisonItems,
        myComparisonView,
        comparisonItems,
        comparisonView,
        MyComparisonItem = Backbone.Model.extend({
            defaults: function () {
                return {};
            },
            clear: function () {
                var count = myComparisonItems.models.length - 1;
                //setMyComparisonItemCount(count);
                $('#my-properties-count').html(count.toString());

                if (count === 0) {
                    $('#my-properties-count').hide();
                    $("#email-comparison-trigger").hide();
                    $("#mycomparison-list-container a#close").click();
                }

                updateComparisonAmenity();

                this.destroy();
            }
        }),
        MyComparisonItemCollection = Backbone.Collection.extend({
            model: MyComparisonItem,
            //NOTE: on iPad, you need to set "Private Browsing" to off, otherwise the saving and deleting of LocalStorage items will be problematic:
            //see http://stackoverflow.com/questions/2603682/is-anyone-else-receiving-a-quota-exceeded-err-on-their-ipad-when-accessing-local
            localStorage: new Store("items-backbone"),
            nextId: function () {
                if (!this.length) { return 1; }
                return this.last().get('id') + 1;
            },
            comparator: function (item) { return item.get("id"); },
            itemsByDisplayName: function (displayname) { return this.filter(function (property) { return property.get('DisplayName') === displayname; }); }
        }),
        MyComparisonItemView = Backbone.View.extend({
            tagName: "li",
            template: $('#mycomparison-list-item-tmpl').template(),
            events: {
                "click a.destroy": "clear"
            },
            initialize: function () {
                //  this.model.bind('change', this.render, this);
                this.model.bind('destroy', this.remove, this);
            },
            render: function () {

                var decoded, tmp;

                // Content in the Goodman CMS is stored as "character-escaped" HTML. The following hack converts the tags:
                tmp = document.createElement("DIV");
                tmp.innerHTML = this.model.attributes.BriefDescription;
                decoded = tmp.textContent || tmp.innerText;

                // We have to do it twice to get the raw data. The above only converts escaped characters to html tags:
                tmp = document.createElement("DIV");
                tmp.innerHTML = decoded;
                this.model.attributes.BriefDescription = tmp.textContent || tmp.innerText;

                if (($.browser.msie) && (parseInt($.browser.version, 10) === 8)) {
                    // See: "$.text() doesn't work on IE8 (it was stripping out whitespace in the pdf filenames) so we use the following hack)"
                    // ... this is the 2nd part of the hack. We need to do some extra data cleansing for IE8
                    tmp = document.createElement("DIV");
                    tmp.innerHTML = this.model.attributes.BriefDescription;
                    //decoded = tmp.textContent || tmp.innerText;
                    this.model.attributes.BriefDescription = tmp.textContent || tmp.innerText;
                }

                $.tmpl(this.template, this.model).appendTo(this.el);

                return this;
            },
            clear: function () {
                this.model.clear();
                updateComparisonAmenity();
            }
        }),
        MyComparisonItemCollectionView = Backbone.View.extend({
            el: $('#mycomparison-list'),
            initialize: function () {
                myComparisonItems.bind('add', this.addOne, this);
                myComparisonItems.bind('reset', this.addAll, this);
                myComparisonItems.bind('all', this.render, this);
                myComparisonItems.fetch();
            },
            render: function () {
            },
            addOne: function (item) {
                var view, propertyOtherSnippet, propertyDateAvailableSnippet;
                view = new MyComparisonItemView({ model: item });
                //this.$("#myitems-list").append(view.render().el);
                $("#myitems-list").append(view.render().el);

                propertyOtherSnippet = getOtherSnippet(item.attributes);
                propertyDateAvailableSnippet = getDateAvailableSnippet(item.attributes);

                $("#comparisonOtherItems-" + item.attributes.DisplayName).html(propertyOtherSnippet);
                $("#propertyDateAvailable-" + item.attributes.DisplayName).html(propertyDateAvailableSnippet);

                // display property lease status
                displayLeaseStatus('#myComparisonDescription #propertyStatus-' + item.attributes.DisplayName, item.attributes.IsLeased, item.attributes.ShowAsNewUntil);

                // handle amenities
                displayAmenity(item.attributes.Amenities, '#myComparisonAmentityContainer-' + item.attributes.DisplayName);
                updateComparisonAmenity();

            },
            addAll: function () {
                myComparisonItems.each(this.addOne);
            }
        }),
        ComparisonItem = Backbone.Model.extend({
            defaults: function () {
                return {};
            }
            //clear: function() {this.destroy();}
        }),
        ComparisonItemCollection = Backbone.Collection.extend({
            model: ComparisonItem,
            //localStorage: new Store("items-backbone"),
            nextId: function () {
                if (!this.length) { return 1; }
                return this.last().get('id') + 1;
            },
            comparator: function (item) { return item.get("id"); },
            itemsByDisplayName: function (displayname) { return this.filter(function (property) { return property.get('DisplayName') === displayname; }); }
        }),
        ComparisonItemView = Backbone.View.extend({

            tagName: "li",
            template: $('#comparison-list-item-tmpl').template(),
            events: {},
            initialize: function () {
                //this.model.bind('change', this.render, this);
                //this.model.bind('destroy', this.remove, this);
            },
            render: function () {
                var decoded, tmp;

                // Content in the Goodman CMS is stored as "character-escaped" HTML. The following hack converts the tags:
                tmp = document.createElement("DIV");
                tmp.innerHTML = this.model.attributes.BriefDescription;
                decoded = tmp.textContent || tmp.innerText;

                // We have to do it twice to get the raw data. The above only converts escaped characters to html tags:
                tmp = document.createElement("DIV");
                tmp.innerHTML = decoded;
                this.model.attributes.BriefDescription = tmp.textContent || tmp.innerText;

                $.tmpl(this.template, this.model).appendTo(this.el);
                return this;
            }
            //clear: function() {
            //  this.model.clear();
            //}
        }),
        ComparisonItemCollectionView = Backbone.View.extend({
            el: $('#comparison-list'),
            initialize: function () {
                comparisonItems.bind('add', this.addOne, this);
                comparisonItems.bind('reset', this.addAll, this);
                comparisonItems.bind('all', this.render, this);
                //  comparisonItems.fetch();
                this.$("#items-list").empty();
            },
            render: function () { },
            addOne: function (item) {
                var view, propertyOtherSnippet, propertyDateAvailableSnippet;
                view = new ComparisonItemView({ model: item });
                this.$("#items-list").append(view.render().el);

                propertyOtherSnippet = getOtherSnippet(item.attributes);
                propertyDateAvailableSnippet = getDateAvailableSnippet(item.attributes);

                $("#comparisonOtherItems2-" + item.attributes.DisplayName).html(propertyOtherSnippet);
                $("#propertyDateAvailable2-" + item.attributes.DisplayName).html(propertyDateAvailableSnippet);

                // display property lease status
                displayLeaseStatus('#myComparisonDescription2 #propertyStatus-' + item.attributes.DisplayName, item.attributes.IsLeased, item.attributes.ShowAsNewUntil);

                // handle amenities
                displayAmenity(item.attributes.Amenities, '#comparisonAmentityContainer-' + item.attributes.DisplayName);
                updateComparisonAmenity('div#comparison-list-container');
            },
            addAll: function () {
                comparisonItems.each(this.addOne);
            }
        }),
        routeA,
        applicationState = {
            /***************************************************************************************************************
            - applicationState is a variable that maintains the state of the application. 
            - It is updated by the navigationRouter when a URL is first loaded and processed.
            - It provides many services, one of which is the correct URL to navigate to when a navigation item is invoked 
            **************************************************************************************************************/
            //currentBaseURL: "http://localhost/",
            currentBaseURL: "http://localhost:41057/",
            //currentBaseURL: "http://"+window.location.hostname+"/totem/",
            //currentBaseURL: "http://"+window.location.hostname+"/totem/new/",
            //currentBaseURL: "http://" + window.location.hostname + "/better-business/",
            //currentBaseURL: "http://" + window.location.hostname + "/betterbusiness/",
            //currentBaseURL: "http://" + window.location.hostname + "/betterbusiness/new/",
            currentScreen: "",
            currentCity: null,
            currentRegion: null,
            currentSubregion: null,
            currentArea: null,
            currentBuildingType: null,
            currentProperty: null,
            filteredRegions: null,
            filteredSubregions: null,
            filteredProperties: null,
            insideCount: 0,
            setStateBasedOnProperty: function (property) {
                logCallee("applicationState.setStateBasedOnProperty " + property);

                if (typeof property === "string") {
                    this.currentProperty = properties.propertiesByDisplayName(property)[0].attributes;
                } else {
                    this.currentProperty = property;
                }
                this.currentCity = cities.citiesByName(this.currentProperty.City)[0].attributes;
                this.currentRegion = regions.regionsByName(this.currentProperty.Region)[0].attributes;
                this.currentSubregion = subregions.subregionsByName(this.currentProperty.SubRegion)[0].attributes;

                this.filteredRegions = new Regions(this.filteredRegions.regionsByCity(this.currentCity.City));
                this.filteredSubregions = new Subregions(this.filteredSubregions.subregionsByRegion(this.currentRegion.Region));

                routeA = new google.maps.LatLng(this.currentProperty.Geo.lat, this.currentProperty.Geo.lng);
                //routeA = this.currentProperty;

                this.currentScreen = "displayname";

            },
            setStateBasedOnCity: function (city) {
                logCallee("applicationState.setStateBasedOnCity " + city);

                if (typeof city === "string") {
                    this.currentCity = cities.citiesByName(city)[0].attributes;
                } else {
                    this.currentCity = city;
                }
                this.currentRegion = null;
                this.currentSubregion = null;
                this.currentProperty = null;

                this.filteredRegions = new Regions(this.filteredRegions.regionsByCity(this.currentCity.City));
                this.filteredSubregions = new Subregions(this.filteredSubregions.subregionsByCity(this.currentCity.City));
                //this.filteredProperties = new Properties(this.filteredProperties.propertiesByCity(this.currentCity.City))

                this.currentScreen = "city";

            },
            setStateBasedOnRegion: function (region) {
                logCallee("applicationState.setStateBasedOnRegion " + region);

                if (typeof region === "string") {
                    this.currentRegion = regions.regionsByName(region)[0].attributes;
                } else {
                    this.currentRegion = region;
                }
                this.currentCity = cities.citiesByName(this.currentRegion.City)[0].attributes;
                this.currentSubregion = null;
                this.currentProperty = null;

                this.filteredRegions = new Regions(this.filteredRegions.regionsByCity(this.currentCity.City));
                this.filteredSubregions = new Subregions(this.filteredSubregions.subregionsByRegion(this.currentRegion.Region));
                //this.filteredProperties = new Properties(this.filteredProperties.propertiesByRegion(this.currentRegion.Region))

                this.currentScreen = "region";

            },
            setStateBasedOnSubregion: function (subregion) {
                logCallee("applicationState.setStateBasedOnSubregion " + subregion);

                if (typeof subregion === "string") {
                    this.currentSubregion = subregions.subregionsByName(subregion)[0].attributes;
                } else {
                    this.currentSubregion = subregion;
                }
                this.currentCity = cities.citiesByName(this.currentSubregion.City)[0].attributes;
                this.currentRegion = regions.regionsByName(this.currentSubregion.Region)[0].attributes;
                this.currentProperty = null;

                this.filteredRegions = new Regions(this.filteredRegions.regionsByCity(this.currentCity.City));
                this.filteredSubregions = new Subregions(this.filteredSubregions.subregionsByRegion(this.currentRegion.Region));
                //we don't filter the properties by subregion. we display all properties on the map, filtered by area/building type...
                //this.filteredProperties = new Properties(this.filteredProperties.propertiesBySubregion(this.currentSubregion.SubRegion));

                this.currentScreen = "subregion";

            },
            setStateBasedOnArea: function (area) {
                logCallee("applicationState.setStateBasedOnArea " + area);

                if (typeof area === "string") {
                    this.currentArea = areas.areasByName(area)[0].attributes;
                } else {
                    this.currentArea = area;
                }
                //this.currentProperty=null;

                if (this.currentArea.AreaName !== "All") {

                    var tempFilteredProperties, propertyAreaArray, length, i, j;
                    tempFilteredProperties = new Properties();

                    length = this.filteredProperties.length;
                    for (i = 0; i < length; i++) {
                        propertyAreaArray = this.filteredProperties.models[i].attributes.PropertyRange.split("|");
                        for (j = 0; j < propertyAreaArray.length; j++) {
                            if (this.currentArea.AreaName == propertyAreaArray[j]) {
                                tempFilteredProperties.add(this.filteredProperties.models[i].attributes);
                                break;
                            }
                        }
                    }

                    this.filteredProperties = tempFilteredProperties;

                }

            },
            setStateBasedOnBuildingType: function (buildingType) {
                logCallee("applicationState.setStateBasedOnBuildingType " + buildingType);

                if (typeof buildingType === "string") {
                    this.currentBuildingType = buildingtypes.buildingTypesByName(buildingType)[0].attributes;
                } else {
                    this.currentBuildingType = buildingType;
                }
                //this.currentProperty=null;

                if (this.currentBuildingType.BuildingTypeName != "All") {

                    var propertyBuildingTypeArray, tempFilteredProperties, length, i, j;
                    tempFilteredProperties = new Properties();

                    length = this.filteredProperties.length;
                    for (i = 0; i < length; i++) {
                        propertyBuildingTypeArray = this.filteredProperties.models[i].attributes.PropertyType.split(",");
                        for (j = 0; j < propertyBuildingTypeArray.length; j++) {
                            if (this.currentBuildingType.BuildingTypeName == $.trim(propertyBuildingTypeArray[j])) {
                                tempFilteredProperties.add(this.filteredProperties.models[i].attributes);
                                break;
                            }
                        }
                    }

                    this.filteredProperties = tempFilteredProperties;
                }
            },
            getRouteForThisState: function () {
                var route = "";

                if (this.currentProperty) { route = "displayname=" + encodeURIComponent(this.currentProperty.DisplayName); }
                else if (this.currentSubregion) { route = "subregion=" + encodeURIComponent(this.currentSubregion.SubRegion); }
                else if (this.currentRegion) { route = "region=" + encodeURIComponent(this.currentRegion.Region); }
                else if (this.currentCity) { route = "city=" + this.currentCity.City; }

                if (this.currentArea) { route += "/area=" + encodeURIComponent(this.currentArea.AreaName); }
                if (this.currentBuildingType) { route += "/buildingtype=" + encodeURIComponent(this.currentBuildingType.BuildingTypeName); }

                logCallee("applicationState.getRouteForThisState " + route);

                return route;
            },
            init: function () {
                logCallee("applicationState.init");

                this.currentCity = null;
                this.currentRegion = null;
                this.currentSubregion = null;
                this.currentArea = null;
                this.currentBuildingType = null;
                this.currentProperty = null;

                this.filteredRegions = regions;
                this.filteredSubregions = subregions;
                this.filteredProperties = properties;

                this.insideCount = 0;

                this.currentScreen = "";

            },
            setCrumbs: function () {
                var crumbHTML;

                if (this.currentCity) { crumbHTML = '<span class="title">city</span><span title="' + this.currentCity.City + '">' + this.currentCity.City + '</span><div class="menu-arrow"></div>'; }
                else { crumbHTML = '<span class="title">city</span>city<div class="menu-arrow"></div>'; }
                //(isMobile) ? $('#city-crumb-m').html(crumbHTML) : $('#city-crumb').html(crumbHTML);
                $('#city-crumb-m').html(crumbHTML);
                $('#city-crumb').html(crumbHTML);

                if (this.currentRegion) { crumbHTML = '<span class="title">region</span><span title="' + this.currentRegion.Region + '">' + this.currentRegion.Region + '</span><div class="menu-arrow"></div>'; }
                else { crumbHTML = '<span class="title">region</span>region<div class="menu-arrow"></div>'; }
                //(isMobile) ? $('#region-crumb-m').html(crumbHTML) : $('#region-crumb').html(crumbHTML);
                $('#region-crumb-m').html(crumbHTML);
                $('#region-crumb').html(crumbHTML);

                if (this.currentSubregion) { crumbHTML = '<span class="title">suburb</span><span title="' + this.currentSubregion.SubRegion + '">' + this.currentSubregion.SubRegion + '</span><div class="menu-arrow"></div>'; }
                else { crumbHTML = '<span class="title">suburb</span>suburb<div class="menu-arrow"></div>'; }
                //(isMobile) ? $('#subregion-crumb-m').html(crumbHTML) : $('#subregion-crumb').html(crumbHTML);
                $('#subregion-crumb-m').html(crumbHTML);
                $('#subregion-crumb').html(crumbHTML);

                if (this.currentArea) { crumbHTML = '<span class="title">area size</span><span title="' + this.currentArea.AreaName + '">' + this.currentArea.AreaName + '</span><div class="menu-arrow"></div>'; }
                else { crumbHTML = '<span class="title">area size</span>area size<div class="menu-arrow"></div>'; }
                //(isMobile) ? $('#area-crumb-m').html(crumbHTML) : $('#area-crumb').html(crumbHTML);
                $('#area-crumb-m').html(crumbHTML);
                $('#area-crumb').html(crumbHTML);

                if (this.currentBuildingType) { crumbHTML = '<span class="title">building type</span><span title="' + this.currentBuildingType.BuildingTypeName + '">' + this.currentBuildingType.BuildingTypeName + '</span><div class="menu-arrow"></div>'; }
                else { crumbHTML = '<span class="title">building type</span>building type<div class="menu-arrow"></div>'; }
                //(isMobile) ? $('#buildingtype-crumb-m').html(crumbHTML) : $('#buildingtype-crumb').html(crumbHTML);
                $('#buildingtype-crumb-m').html(crumbHTML);
                $('#buildingtype-crumb').html(crumbHTML);

            },
            getFeaturedProperties: function () {

                var featuredArray, featuredProperties, length, i;
                featuredArray = [];
                featuredProperties = new Properties();

                /*
                var cityProperties = new Properties(this.filteredProperties.propertiesByCity(this.currentCity.City));
                //var subregionProperties = new Properties(this.filteredProperties.propertiesBySubregion(this.currentSubregion.SubRegion));     

                var length = cityProperties.length;
                for (var i = 0; i < length; i++) {
                if (this.currentSubregion.SubRegion != cityProperties.models[i].attributes.SubRegion) {
                if ($.inArray(cityProperties.models[i].attributes.DisplayName, featuredArray) == -1) {
                featuredArray.push(cityProperties.models[i].attributes.DisplayName);
                }
                if (featuredArray.length >= 2) { break; }
                }
                }

                if (featuredArray.length < 2) {
                var externalProperties = this.filteredProperties;
                length = externalProperties.length;
                for (var i = 0; i < length; i++) {
                if (this.currentCity.City != externalProperties.models[i].attributes.City) {
                if ($.inArray(externalProperties.models[i].attributes.DisplayName, featuredArray) == -1) {
                featuredArray.push(externalProperties.models[i].attributes.DisplayName);
                }
                if (featuredArray.length >= 2) { break; }
                }
                }
                }

                for (var i = 0; i < featuredArray.length; i++) {
                featuredProperties.add(properties.propertiesByDisplayName(featuredArray[i])[0].attributes);
                }
                */

                length = properties.length;
                for (i = 0; i < length; i++) {

                    if ((properties.models[i].attributes.FeaturedIndustrial == "True") || (properties.models[i].attributes.FeaturedCommercial == "True") || (properties.models[i].attributes.FeaturedDevelopment == "True")) {

                        logCallee("featured property: " + properties.models[i].attributes.Region + " " + properties.models[i].attributes.SubRegion + " " + properties.models[i].attributes.DisplayName);

                        if ((this.currentSubregion.SubRegion != properties.models[i].attributes.SubRegion) && (this.currentRegion.Region == properties.models[i].attributes.Region)) {
                            featuredArray.push(properties.models[i].attributes.DisplayName);
                            if (featuredArray.length >= 2) { break; }
                        }

                    }

                }

                for (i = 0; i < featuredArray.length; i++) {
                    featuredProperties.add(properties.propertiesByDisplayName(featuredArray[i])[0].attributes);
                }

                if (featuredProperties.length == 0) {
                    $("#featured-list-title").hide();
                    $("#featured-list").hide();
                }
                else {
                    $("#featured-list-title").show();
                    $("#featured-list").show();
                }

                return featuredProperties;
            }
        },
        map = this.map,
        mapOptions = {},
        boundsChangedHandle,
        clickHandle,
        boundsHandle,
        zoomHandle,
    //The following represent latitude and longitude bounds for Australia. These will be used to restrict the user's movement
        maxSouth = "-45",
        maxNorth = "-7",
        maxWest = "106",
        maxEast = "162",
        southWest = new google.maps.LatLng(maxSouth, maxWest),
        northEast = new google.maps.LatLng(maxNorth, maxEast),
        allowedBounds = new google.maps.LatLngBounds(southWest, northEast),
        maxSouth,
        maxNorth,
        maxWest,
        maxEast,
        southWest,
        northEast,
        bounds,
        currentGeo,
    //var placeTypesObject = {cafe:null,bar:null,store:null,restaurant:null,park:null,parking:null,movie_theater:null,gym:null,post_office:null,atm:null,hospital:null,airport:null,bus_station:null,train_station:null,university:null,gas_station:null,shopping_mall:null};
        placeTypesObject = {
            //the following are the google place types. these are retrieved using the Google Places API.
            //TODO: Google Maps Business API license doesn't offer any support for the use of Places API. Should we get a separate Places API license?
            train_station: { icon: "pins/train.png", grouping: "transport" },
            university: { icon: "pins/university.png", grouping: "utilities" },
            gas_station: { icon: "pins/petrol.png", grouping: "utilities" },
            shopping_mall: { icon: "pins/shopping-mall.png", grouping: "shopping" },
            atm: { icon: "pins/atm.png", grouping: "utilities" },
            hospital: { icon: "pins/hospital.png", grouping: "utilities" },
            post_office: { icon: "pins/post.png", grouping: "utilities" },
            parking: { icon: "pins/parking.png", grouping: "transport" },
            store: { icon: "pins/store.png", grouping: "shopping" },
            bar: { icon: "pins/bar.png", grouping: "food" },
            cafe: { icon: "pins/cafe.png", grouping: "food" },
            restaurant: { icon: "pins/restaurant.png", grouping: "food" },
            airport: { icon: "pins/airport.png", grouping: "transport" },
            bus_station: { icon: "pins/bus-stop.png", grouping: "transport" },
            gym: { icon: "pins/gym.png", grouping: "leisure" },
            movie_theater: { icon: "pins/cinema.png", grouping: "leisure" },
            //the following are the Goodman place types. Goodman places are retrieved from a fusion table.
            //TODO: it's still not totally clear whether or not the Google Maps Business API license allows this. The GMBA allows the usage of 
            //fusion tables, but the example I found uses the Visualization API to retrieve the places from a fusion table
            //http://support.google.com/fusiontables/bin/answer.py?hl=en&answer=2459324 ("yes you can use fusion tables")
            //https://developers.google.com/fusiontables/docs/sample_code#gviz ("here are some fusion table code samples")
            //https://developers.google.com/fusiontables/docs/samples/custom_markers ("this sample uses the visualisation API as well")
            office: { icon: "pins/CBD.png", grouping: "custom" },
            tourism: { icon: "pins/parks.png", grouping: "custom" },
            //below are places retrieved from RTA - eg: traffic cams, etc
            rtacam: { icon: "pins/rta.png", grouping: "trafficCameras" }
        },
        placeTypesArray = [],
        placesRequestCount = 0,
        placesRequestCountMax = 4,
        locations = {},
        currentWeightedCentre,
        directionsDisplay,
        directionsService,
        placesRequest,
        placesService,
        trafficLayer,
        fusionTablesLayer,
        marker,
        googlePlaceMarker,
        goodmanPlaceMarker,
        rtaPlaceMarker,
    //var minZoomLevel = 13;
    //var maxZoomLevel = 15;
        distanceService,
        routeObject = {},
        routeArray = [],
        routeNameArray = [],
        distanceBlurb = "",
        markerA,
        markerB,
        routeB,
        pinkParkStyleMapType,
        blueRoadStyleMapType,
        desaturatedStyleMapType,
        unclutteredStyleMapType, //freeways
        unclutteredStyleMapType2, //freeways & arterial roads
        unclutteredStyleMapType3, //freeways, arterial roads & local roads
        retrievedURLs,
        retrieveURLs;
    //rotateWelcomeVideoTimerId,
    //rotateWelcomeVideoCounter = 0;



    function RegionMarker(latlng, map, propertyCount, locationName) {

        // RegionMarker is used to represent "complex" markers like region and subregion markers.
        // Here are examples of how they can be used:
        //http://gmaps-samples-v3.googlecode.com/svn/trunk/overlayview/custommarker.html
        //https://developers.google.com/maps/documentation/javascript/overlays#drawing_events

        this.latlng = latlng;
        this.propertyCount = propertyCount;
        this.locationName = locationName;

        // Once the LatLng and text are set, add the overlay to the map.  This will
        // trigger a call to panes_changed which should in turn call draw.
        this.setMap(map);
    }

    RegionMarker.prototype = new google.maps.OverlayView();

    RegionMarker.prototype.draw = function () {
        var me, div, data, divTemp, panes, point;
        me = this;

        // Check if the div has been created.
        div = this.div;
        if (!div) {

            data = { count: this.propertyCount,
                location: this.locationName
            };
            divTemp = $("#region-marker-item-tmpl").tmpl(data);
            div = this.div = divTemp[0];

            google.maps.event.addDomListener(div, "click", function (event) {
                google.maps.event.trigger(me, "click");
            });

            // Then add the overlay to the DOM
            panes = this.getPanes();
            panes.floatPane.appendChild(div);
        }

        // Position the overlay 
        point = this.getProjection().fromLatLngToDivPixel(this.latlng);
        if (point) {
            div.style.left = point.x + 'px';
            div.style.top = point.y + 'px';
        }
    };

    RegionMarker.prototype.remove = function () {
        // Check if the overlay was on the map and needs to be removed.
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        }
        this.setMap(null);
    };

    RegionMarker.prototype.getPosition = function () {
        return this.latlng;
    };

    function PropertyMarker(latlng, map, property) {

        // PropertyMarker is used to represent "complex" markers like property markers.
        this.latlng = latlng;
        this.property = property;

        // Once the LatLng and text are set, add the overlay to the map.  This will
        // trigger a call to panes_changed which should in turn call draw.
        this.setMap(map);
    }

    PropertyMarker.prototype = new google.maps.OverlayView();

    PropertyMarker.prototype.draw = function () {
        var me, div, data, divTemp, panes, point;
        me = this;

        // Check if the div has been created.
        div = this.div;
        if (!div) {

            data = {
                location: this.property.PropertyName
            };
            divTemp = $("#property-marker-item-tmpl").tmpl(data);
            div = this.div = divTemp[0];

            google.maps.event.addDomListener(div, "click", function (event) {
                google.maps.event.trigger(me, "click");
            });

            // Then add the overlay to the DOM
            panes = this.getPanes();
            //panes.floatPane.appendChild(div);
            panes.overlayImage.appendChild(div);

        }

        // Position the overlay 
        point = this.getProjection().fromLatLngToDivPixel(this.latlng);
        if (point) {
            //div.style.left = (point.x - 93) + 'px';
            //div.style.top = (point.y - 72) + 'px';
            div.style.left = (point.x) + 'px';
            div.style.top = (point.y - 56) + 'px';
        }
    };

    PropertyMarker.prototype.remove = function () {
        // Check if the overlay was on the map and needs to be removed.
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        }
        this.setMap(null);
    };

    PropertyMarker.prototype.getPosition = function () {
        return this.latlng;
    };

    var navigationRouter;

    /*******************************************************************************************************************************
    The Backbone.Router is the core component of the Backbone.js framework. It handles individual URLs within a single-page app. 
    Set it up in the following way:
    - The "routes" property holds all the possible URL combinations for the application.
    - Each URL handled by the application is matched to a particular function. So referring to below, "area=:area": "handleArea", for example, 
    would match a URL of ...#area=All to the handleArea() function.
    - In the handleArea() function, we place the logic that should be performed for this particular URL.
    All URL functions behave in a similar fashion. They:
    - Set up applicationState according to any querystring parameters, etc. (applicationState is a global variable that maintains
    the state of the application)
    - perform google analytics tracking
    - perform necessary logic to set up the screen (build panels, initialise the map, etc)
    The initialize() function is run once, when the app is first loaded, after the router is initialised
    The Backbone.Router also automatically handles URL history and the browser back-button
    *******************************************************************************************************************************/
    var NavigationRouter = Backbone.Router.extend({

        routes: {

            "area=:area": "handleArea",
            "buildingtype=:buildingtype": "handleBuildingType",
            "city=:city": "handleCity",
            "city=:city/area=:area": "handleCityArea",
            "city=:city/buildingtype=:buildingtype": "handleCityBuildingType",
            "city=:city/area=:area/buildingtype=:buildingtype": "handleCityAreaBuildingType",
            "region=:region": "handleRegion",
            "region=:region/area=:area": "handleRegionArea",
            "region=:region/buildingtype=:buildingtype": "handleRegionBuildingType",
            "region=:region/area=:area/buildingtype=:buildingtype": "handleRegionAreaBuildingType",
            "subregion=:subregion": "handleSubregion",
            "subregion=:subregion/area=:area": "handleSubregionArea",
            "subregion=:subregion/buildingtype=:buildingtype": "handleSubregionBuildingType",
            "subregion=:subregion/area=:area/buildingtype=:buildingtype": "handleSubregionAreaBuildingType",
            "displayname=:displayname": "handleProperty",
            "displayname=:displayname/area=:area": "handlePropertyArea",
            "displayname=:displayname/buildingtype=:buildingtype": "handlePropertyBuildingType",
            "displayname=:displayname/area=:area/buildingtype=:buildingtype": "handlePropertyAreaBuildingType",
            "mycomparison": "handleMyComparisonRequest",
            "comparison=:propertiesToCompare": "handleComparisonRequest",
            "route=:AandB": "handleRouteRequest",
            "*actions": "defaultRoute"
        },
        initialize: function (options) {

            logCallee("initialize");

            //querystring = $.getUrlVars();
            if (window.location.href.indexOf("#") != -1) {
                initialRoute = window.location.href.substr(window.location.href.indexOf("#") + 1, window.location.href.length);
            }
            logCallee("!!!!!!!!!!!!!!initialRoute: " + initialRoute);
            //TRACKING - Initial Route 
            _gaq.push(['_trackEvent', 'GBB-URL', "#" + initialRoute]);
            _gaq.push(['_trackPageview', "vp/" + initialRoute]);

            // this is a FIX for the following error: double clicking on region pins would select text and map tiles in an eerie way...
            $("*").dblclick(function (e) {
                e.preventDefault();
            })

            myComparisonItems = new MyComparisonItemCollection();
            myComparisonView = new MyComparisonItemCollectionView();

            for (var name in placeTypesObject) placeTypesArray.push(name);

            isTouch = $("html").hasClass("touch");

            is_chrome = navigator.userAgent.indexOf('Chrome') > -1,
            is_explorer = navigator.userAgent.indexOf('MSIE') > -1,
            is_firefox = navigator.userAgent.indexOf('Firefox') > -1,
            is_safari = navigator.userAgent.indexOf("Safari") > -1,
            is_Opera = navigator.userAgent.indexOf("Presto") > -1;

            if ((is_chrome) && (is_safari)) { is_safari = false; }

            createFooterPanel();

            //clearInterval(rotateWelcomeVideoTimerId);

            return this;
        },
        handleArea: function (area) {
            logCallee("handleArea area-size=" + area);

            applicationState.init();
            applicationState.setStateBasedOnArea(decodeURIComponent(area));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);

            }

            homeScreen();

            firstRouteEvent = false;
        },
        handleBuildingType: function (buildingtype) {
            logCallee("handleBuildingType building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);

            }

            homeScreen();

            firstRouteEvent = false;
        },
        handleCity: function (city) {
            logCallee("handleCity " + city);

            applicationState.init();
            applicationState.setStateBasedOnCity(decodeURIComponent(city));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            cityScreen();

            firstRouteEvent = false;
        },
        handleCityArea: function (city, area) {
            logCallee("handleCityArea " + city + ", area-size=" + area);

            applicationState.init();
            applicationState.setStateBasedOnCity(decodeURIComponent(city));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            cityScreen();

            firstRouteEvent = false;
        },
        handleCityBuildingType: function (city, buildingtype) {
            logCallee("handleCityBuildingType " + city + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnCity(decodeURIComponent(city));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            cityScreen();

            firstRouteEvent = false;
        },
        handleCityAreaBuildingType: function (city, area, buildingtype) {
            logCallee("handleCityAreaBuildingType " + city + ", area-size=" + area + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnCity(decodeURIComponent(city));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            cityScreen();

            firstRouteEvent = false;
        },
        handleRegion: function (region) {
            logCallee("handleRegion " + region);

            applicationState.init();
            applicationState.setStateBasedOnRegion(decodeURIComponent(region));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            regionScreen();

            firstRouteEvent = false;
        },
        handleRegionArea: function (region, area) {
            logCallee("handleRegionArea " + region + ", area-size=" + area);

            applicationState.init();
            applicationState.setStateBasedOnRegion(decodeURIComponent(region));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            regionScreen();

            firstRouteEvent = false;
        },
        handleRegionBuildingType: function (region, buildingtype) {
            logCallee("handleRegionBuildingType " + region + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnRegion(decodeURIComponent(region));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            regionScreen();

            firstRouteEvent = false;
        },
        handleRegionAreaBuildingType: function (region, area, buildingtype) {
            logCallee("handleRegionAreaBuildingType " + region + ", area-size=" + area + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnRegion(decodeURIComponent(region));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            regionScreen();

            firstRouteEvent = false;
        },
        handleSubregion: function (subregion) {
            logCallee("handleSubregion " + subregion);

            applicationState.init();
            applicationState.setStateBasedOnSubregion(decodeURIComponent(subregion));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            subregionScreen();

            firstRouteEvent = false;
        },
        handleSubregionArea: function (subregion, area) {
            logCallee("handleSubregionArea " + subregion + ", area-size=" + area);

            applicationState.init();
            applicationState.setStateBasedOnSubregion(decodeURIComponent(subregion));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            subregionScreen();

            firstRouteEvent = false;
        },
        handleSubregionBuildingType: function (subregion, buildingtype) {
            logCallee("handleSubregionBuildingType " + subregion + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnSubregion(decodeURIComponent(subregion));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            subregionScreen();

            firstRouteEvent = false;
        },
        handleSubregionAreaBuildingType: function (subregion, area, buildingtype) {
            logCallee("handleSubregionAreaBuildingType " + subregion + ", area-size=" + area + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnSubregion(decodeURIComponent(subregion));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            subregionScreen();

            firstRouteEvent = false;
        },
        handleProperty: function (displayname) {
            logCallee("handleProperty " + displayname);

            applicationState.init();
            applicationState.setStateBasedOnProperty(decodeURIComponent(displayname));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            propertyScreen();

            firstRouteEvent = false;

        },
        handlePropertyArea: function (displayname, area) {
            logCallee("handlePropertyArea " + displayname + ", area-size=" + area);

            applicationState.init();
            applicationState.setStateBasedOnProperty(decodeURIComponent(displayname));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            propertyScreen();

            firstRouteEvent = false;

        },
        handlePropertyBuildingType: function (displayname, buildingtype) {
            logCallee("handlePropertyBuildingType " + displayname + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnProperty(decodeURIComponent(displayname));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            propertyScreen();

            firstRouteEvent = false;

        },
        handlePropertyAreaBuildingType: function (displayname, area, buildingtype) {
            logCallee("handlePropertyAreaBuildingType " + displayname + ", area-size=" + area + ", building-type=" + buildingtype);

            applicationState.init();
            applicationState.setStateBasedOnProperty(decodeURIComponent(displayname));
            applicationState.setStateBasedOnArea(decodeURIComponent(area));
            applicationState.setStateBasedOnBuildingType(decodeURIComponent(buildingtype));

            if (!firstRouteEvent) {
                var currentRoute = applicationState.getRouteForThisState();
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#" + currentRoute]);
                _gaq.push(['_trackPageview', "vp/" + currentRoute]);
            }

            propertyScreen();

            firstRouteEvent = false;

        },
        handleMyComparisonRequest: function () {
            logCallee("handleMyComparisonRequest");

            if (!firstRouteEvent) {
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#mycomparison"]);
                _gaq.push(['_trackPageview', "vp/mycomparison"]);
            }

            myComparisonScreen();

            firstRouteEvent = false;

        },
        handleComparisonRequest: function (propertiesQueryStringFragment) {
            logCallee("handleComparisonRequest " + propertiesQueryStringFragment);

            if (!firstRouteEvent) {
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#comparison=" + propertiesQueryStringFragment]);
                _gaq.push(['_trackPageview', "vp/comparison=" + propertiesQueryStringFragment]);
            }

            applicationState.init();

            comparisonScreen(propertiesQueryStringFragment);

            firstRouteEvent = false;

        },
        handleRouteRequest: function (queryStringParameters) {
            logCallee("handleRouteRequest " + queryStringParameters);

            if (!firstRouteEvent) {
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#route=" + queryStringParameters]);
                _gaq.push(['_trackPageview', "vp/route=" + queryStringParameters]);
            }

            routeRequestScreen(queryStringParameters);

            firstRouteEvent = false;

        },
        defaultRoute: function () {

            logCallee("defaultRoute ");

            if (firstRouteEvent) {

                getGeolocatedSubregion();

            }
            else {
                //TRACKING - Route 
                _gaq.push(['_trackEvent', 'GBB-URL', "#"]);
                _gaq.push(['_trackPageview', "vp/"]);

                homeRoute();

            }

            //firstRouteEvent = false;
        }
    });

    /*
    function rotateWelcomeVideo() {
    //alert("hi");

    logCallee("########## rotateWelcomeVideo ############### " + rotateWelcomeVideoCounter);

    $("#welcomeTestimonial").attr("href", "http://www.youtube.com/embed/" + allPodTestimonials[rotateWelcomeVideoCounter].url + "?rel=0&wmode=transparent");

    //This is a hack just for Sydney West - they didn't like the default photo.
    if (allPodTestimonials[rotateWelcomeVideoCounter].url === "ZkOy2ow4S5k") {
    $("#welcomeTestimonial img").attr({ src: "img/sydneyWest.jpg" });
    }
    else {
    $("#welcomeTestimonial img").attr({ src: "http://i2.ytimg.com/vi/" + allPodTestimonials[rotateWelcomeVideoCounter].url + "/default.jpg" });
    }

    $("#welcomeTestimonial p").text(allPodTestimonials[rotateWelcomeVideoCounter].blurb);

    if (rotateWelcomeVideoCounter === allPodTestimonials.length - 1) {
    rotateWelcomeVideoCounter = 0;
    }
    else {
    rotateWelcomeVideoCounter++;
    }

    }
    */

    function getGeolocatedSubregion() {

        logCallee("getGeolocatedSubregion");

        if ((Modernizr.geolocation) && (!is_firefox)) {
            // TODO: geolocation on Firefox is patchy and problematic

            logCallee("This browser supports geolocation!");

            navigator.geolocation.getCurrentPosition(geo_success, geo_error);

        } else {

            logCallee('Geolocation is not supported.');

            homeRoute();

            firstRouteEvent = false;
        }

    }

    function geo_success(position) {

        logCallee("geolocation=" + position.coords.latitude + "," + position.coords.longitude);

        var geolocationSubRegion = matchGeolocationWithSubregion(position);

        if (geolocationSubRegion != "") {

            applicationState.init();

            applicationState.setStateBasedOnSubregion(geolocationSubRegion);
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
        }
        else {
            homeRoute();

            firstRouteEvent = false;

        }

    }

    function matchGeolocationWithSubregion(position) {

        logCallee("matchGeolocationWithSubregion=" + position.coords.latitude + "," + position.coords.longitude);

        var currentNearest = Number.POSITIVE_INFINITY;
        var currentNearestSubregion = "";
        var currentLat;
        var currentLng;
        var currentDistance;

        var userLat = position.coords.latitude * -1;
        var userLng = position.coords.longitude;

        for (var i = 0; i < subregions.length; i++) {

            currentLat = subregions.models[i].attributes.Geo.lat * -1;
            currentLng = subregions.models[i].attributes.Geo.lng;

            // for each subregion, calculate the sum of the squares of the X and Y distance deltas between the user's location and the subregion location.
            // (don't bother finding the hypotenuse by calculating the square root. This is an unnecessary overhead)
            currentDistance = (userLat - currentLat) * (userLat - currentLat) + (userLng - currentLng) * (userLng - currentLng);

            if (currentDistance < currentNearest) {
                currentNearest = currentDistance;
                currentNearestSubregion = subregions.models[i].attributes.SubRegion;
            }

            logCallee(subregions.models[i].attributes.SubRegion + " " + subregions.models[i].attributes.Geo.lat + " " + subregions.models[i].attributes.Geo.lng);
        }

        //TODO: if geolocation starts giving trouble, swap the two lines below to put GBB back to normal, without geolocation
        return currentNearestSubregion;
        //return "";

    }

    function geo_error(err) {

        // The PositionError object returned contains the following attributes:
        // code: a numeric response code
        // PERMISSION_DENIED = 1
        // POSITION_UNAVAILABLE = 2
        // TIMEOUT = 3
        // message: Primarily for debugging. It's recommended not to show this error
        // to users.

        if (err.code == 1) {
            logCallee('geo_success - The user denied the request for location information.')
        } else if (err.code == 2) {
            logCallee('geo_success - Your location information is unavailable.')
        } else if (err.code == 3) {
            logCallee('geo_success - The request to get your location timed out.')
        } else {
            logCallee('geo_success - An unknown error occurred while requesting your location.')
        }

        homeRoute();

        firstRouteEvent = false;

    }

    function homeRoute() {

        logCallee("homeRoute");

        applicationState.init();

        applicationState.currentScreen = "home";

        homeScreen();

    }

    function createContactUsPanel() {

        logCallee("createContactUsPanel");

        $('#contact-us-container').show();

        initMedia();

        createContactUsView();

    }

    function createContactUsView() {
        logCallee("createContactUsView");

        // The Contact Us popup will comprise a model (the collection of data items that populate the panel) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var contactUsView = new ContactUsView({ model: null });
        contactUsView.render();

        // Set the state appropriately:
        applicationState.currentProperty = null;
        // Trigger a URL change, based on the updated application state:
        // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
        navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("contact-us closeHandler");

            $('#contact-us-container').hide();

            // Set the state appropriately:
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

            event.preventDefault();
        };
        $("#contact-us a#close").bind("click", closeHandler);
    }

    function createAboutPanel() {
        logCallee("createAboutPanel");

        $('#about-container').show();

        initMedia();

        createAboutView();

    }

    function createTestimonialItemPanel() {
        logCallee("createTestimonialItemPanel");

        $('#testimonialItem-container').show();
        $('#footer-container').removeClass("ipadfooter");

        initMedia();

        createTestimonialItemView();

    }
    function createAboutView() {

        logCallee("createAboutView");

        // The About popup will comprise a model (the collection of data items that populate the panel) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var aboutView = new AboutView({ model:
        {
            //mainBlurb: "Hi There, this is the about area.",
            mainBlurb: bbxtras.bbxtrasByTypePrimary("about")[0].attributes.Content,
            main1Blurb: "",
            main2Blurb: ""
        }
        });
        aboutView.render();

        // Set the state appropriately:
        applicationState.currentProperty = null;
        // Trigger a URL change, based on the updated application state:
        // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
        navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("about closeHandlerf");

            $('#about-container').hide();

            // Set the state appropriately:
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

            event.preventDefault();
        };
        $("#about a#close").bind("click", closeHandler);
    }

    function createTestimonialItemView() {

        logCallee("createTestimonialItemView");

        // The TestimonialItem popup will comprise a model (the collection of data items that populate the popup) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var testimonialItemView = new TestimonialItemView({ model: null });
        testimonialItemView.render();

        // Set the state appropriately - if we are in the property info screen this needs to be set to the subregion screen
        applicationState.currentProperty = null;
        // Trigger a URL change, based on the updated application state:
        // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
        navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("testimonialItem closeHandler");

            $('#testimonialItem-container').hide();

            // Set the state appropriately:
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

            event.preventDefault();
        };


        // jQuery lightbox plugin - ColorBox v1.3.19.3 - is used for the lightbox
        $('#testimonialItem-container a.testimonialListVideo').colorbox({ rel: 'testimonialListVideo', iframe: true, innerWidth: function () {
            //$('#city-select-container').hide();
            hideCitySelectPanel();

            var innerWidth = '500', viewport = $(window).width();
            if (viewport < 767) { innerWidth = '420'; } else if (viewport >= 768) { innerWidth = '700'; }
            return innerWidth;
        },
            innerHeight: function () {
                var innerHeight = '400', viewport = $(window).width();
                if (viewport < 767) { innerHeight = '310'; } else if (viewport >= 768) { innerHeight = '500'; }
                return innerHeight;
            },
            maxWidth: function () {
                var maxWidth = '100%', viewport = $(window).width();
                if (viewport > 960) { maxWidth = '60%'; } else if (viewport >= 768) { maxWidth = '50%'; }
                return maxWidth;
            }
        });

        $("#testimonialItem a#close").bind("click", closeHandler);
    }

    function routeRequestScreen(queryStringParameters) {
        logCallee("routeRequestScreen");

        // This function builds the route request screen (initiated from the property info screen)

        try {

            // Route source and destination information was passed via the querystring:
            var queryStringParametersArray = queryStringParameters.split(",");

            // Here we set the application state back to Property Info, in order to navigate back:
            applicationState.init();
            applicationState.setStateBasedOnProperty(queryStringParametersArray[0]);

            applicationState.currentScreen = "route";

            setMapToSubregion(applicationState.currentSubregion);

            if (queryStringParametersArray.length == 2) {
                // A route request to airport, seaport, or city was made:
                routeB = { title: locations[queryStringParametersArray[1]].title, Geo: new google.maps.LatLng(locations[queryStringParametersArray[1]].Geo.lat, locations[queryStringParametersArray[1]].Geo.lng), address: locations[queryStringParametersArray[1]].address };
            }
            else if (queryStringParametersArray.length >= 3) {
                // A custom route request was made:
                routeB = { title: "custom", Geo: new google.maps.LatLng(queryStringParametersArray[1], queryStringParametersArray[2]), address: decodeURIComponent(queryStringParametersArray[3]) + decodeURIComponent(queryStringParametersArray[4]) };
            }

            // Initialise the screen - clear all panels and markers.
            initScreen();

            // Create the search/nav panel
            createSearchPanel();

            // Create the route info panel
            createRouteInfoPanel();

            // Remove the map drag/zoom listener (no need to worry about retrieving Google Place information here)
            if (boundsChangedHandle) google.maps.event.removeListener(boundsChangedHandle);

            // Invoke the Google Directions service to render the route:
            handleDirectionRequest(routeA, routeB.Geo);

            //google.maps.event.removeListener(clickHandle);

            // Add a marker to the map to represent the route "from" point  
            var markerA = new google.maps.Marker({
                map: map,
                position: routeA,
                icon: 'img/goodman_pointer.png'
            });

            // Add a marker to the map to represent the route "to" point  
            var markerB = new google.maps.Marker({
                map: map,
                position: routeB.Geo,
                icon: 'img/pins/destination.png'
            });

        }
        catch (e) {
            logCallee("Error building the route screen: " + e)

            navigationRouter.navigate("#", { trigger: true });
        }

    }

    function createRouteInfoPanel() {
        logCallee("createRouteInfoPanel");

        $('#route-info-container').show();

        createRouteInfoView();

    }

    function createRouteInfoView() {
        logCallee("createRouteInfoView");

        // This function builds the route info popup on the route screen.
        // The route info popup will comprise a model (the collection of data items that populate the popup) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var routeInfoView = new RouteInfoView({ model:
        {
            propertyname: applicationState.currentProperty.PropertyName,
            PropertyAddress1: applicationState.currentProperty.PropertyAddress1,
            PropertyAddress2: applicationState.currentProperty.SubRegion,
            destination: (routeB.title == "custom") ? "Custom address" : applicationState.currentCity.City + " " + routeB.title,
            destinationAddress: routeB.address
        }
        });
        routeInfoView.render();

        // Create the exit button handler and attach it to the exit button
        var exitHandler;
        exitHandler = function (event) {
            logCallee("route-info exitHandler");

            // To get to the route screen we came from the property info screen. 
            // Therefore we don't need to adjust the application state in order to navigate back:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });

            event.preventDefault();
        };
        $(".route-info-exit").bind("click", exitHandler);

        // We need to display the distance from point A to point B. The following function determines the distance between each and
        // displays the information in the appropriate place:
        calculateDistances(new google.maps.LatLng(applicationState.currentProperty.Geo.lat, applicationState.currentProperty.Geo.lng), routeB);

    }

    function myComparisonScreen() {
        logCallee("myComparisonScreen");

        applicationState.currentScreen = "myComparisonScreen";

        // This function handles the My Properties screen

        if (!fromClickEvent) {

            // We've arrived here from a deep link. We need to build everything on the page, including the map...

            // Initialise state
            applicationState.init();

            // Initialise the screen - clear all panels and markers.
            initScreen();

            // Set map to Australia
            setMapToAustralia();
        }
        else {

            // Stop/clear any videos
            initMedia();

            // Remove all panels
            removePanels();

        }

        // Create the search/nav panel
        createSearchPanel();

        // Create the My Comparison panel
        createMyComparisonPanel();
    }

    function comparisonScreen(propertiesQueryStringFragment) {
        logCallee("comparisonScreen");

        // This function handles the Comparison screen. This is similar to the My Properties screen except that we arrive here from a link on
        // the "Email a colleague" email. Also, there are no close buttons

        comparisonItems = new ComparisonItemCollection();
        comparisonView = new ComparisonItemCollectionView();

        // We extract the property display names from the URL, retrieve the relevant properties, and display them in the panel
        var propertiesToCompare = propertiesQueryStringFragment.split(",");
        for (var i = 0; i < propertiesToCompare.length; i++) {
            //logCallee(propertiesToCompare[i]);
            var currentPropertyToCompare = properties.propertiesByDisplayName(decodeURIComponent(propertiesToCompare[i]))[0].attributes;
            comparisonItems.add(currentPropertyToCompare);
        }

        // Initialise the screen - clear all panels and markers.
        initScreen();

        // Create the search/nav panel
        createSearchPanel();

        // Create the Comparison panel
        createComparisonPanel();

        setMapToAustralia();
    }

    function createMyComparisonPanel() {
        logCallee("createMyComparisonPanel");

        myComparisonItemCollectionView();

        $('#mycomparison-list-container').show();
        $('#mycomparison-list').show();
    }

    function createComparisonPanel() {
        logCallee("createComparisonPanel");

        comparisonItemCollectionView();

        $('#comparison-list-container').show();
    }

    function setMyComparisonItemCount(count) {
        logCallee("setMyComparisonItemCount");

        $('#my-properties-count').html(count.toString());
    }

    function getMyComparisonItemCount() {
        logCallee("getMyComparisonItemCount");

        return myComparisonItems.models.length;
    }

    function createFooterPanel() {
        logCallee("createFooterPanel");

        // This function creates the footer panel

        //TODO: My Comparison assets should really be moved to the Search/Nav panel

        var count = getMyComparisonItemCount();
        var panAmount = 200;

        // Set the My Properties icon counter
        setMyComparisonItemCount(count);

        // Create the handler that opens the My Properties panel and attach it to the My Properties button.
        var compareHandler;
        compareHandler = function (event) {
            logCallee("#mycomparison triggered");

            // Only open the My Properties panel if there are properties saved
            if (getMyComparisonItemCount() > 0) {
                fromClickEvent = true;

                $('#footer-container').addClass("ipadfooter");

                // Reset the application state 
                applicationState.currentProperty = null;
                // Trigger a URL change, based on the updated application state:
                navigationRouter.navigate("#mycomparison", { trigger: true });
            }

            event.preventDefault();
        };
        $("#headerMenu ul#menu a#compare").bind("click", compareHandler);

        // Don't show the red count indicator if there are no saved properties
        if (count == 0) {
            $('#my-properties-count').hide();
        }

        // Set up the zoom controls
        $("#zoomOutButton").bind("click", function (event) {

            logCallee('out');

            var zoom = map.getZoom();
            zoom--;
            map.setZoom(zoom);
            event.preventDefault();
        });

        $("#zoomInButton").bind("click", function (event) {

            logCallee('in');

            var zoom = map.getZoom();
            zoom++;
            map.setZoom(zoom);
            event.preventDefault();
        });

        $("#northButton").bind("click", function (event) {

            logCallee('up');

            map.panBy(0, -panAmount);

            event.preventDefault();
        });

        $("#southButton").bind("click", function (event) {

            logCallee('down');

            map.panBy(0, panAmount);

            event.preventDefault();
        });

        $("#eastButton").bind("click", function (event) {

            logCallee('right');

            map.panBy(panAmount, 0);

            event.preventDefault();
        });

        $("#westButton").bind("click", function (event) {

            logCallee('left');

            map.panBy(-panAmount, 0);

            event.preventDefault();
        });


        $('#footer-container').removeClass("hidden");
    }

    function myComparisonItemCollectionView() {
        logCallee("myComparisonItemCollectionView");

        // This function builds the My Properties panel

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("mycomparison-list-container panel closeHandler");

            $('#mycomparison-list-container').hide();

            $('#footer-container').removeClass("ipadfooter");

            if ((applicationState.currentSubregion) && (applicationState.currentScreen != "route")) {
                // Closing the My Properties panel should re-open the following panels, if we were previously in the subregion screen:
                createPlaceControlsPanel();
                createPropertyListPanel();
                createTestimonialListPanel();
            }

            // Reset the application state 
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

            event.preventDefault();
        };

        // Create the handler that removes all the my property items.
        var clearallHandler;
        clearallHandler = function (event) {
            logCallee("mycomparison-list-container panel clearall");

            var count = myComparisonItems.models.length;

            for (var i = count - 1; i >= 0; i--) {
                myComparisonItems.models[i].clear();
            }

            event.preventDefault();
        };

        // Create the handler that opens the Email a colleague popup and attach it to the mail icon.
        var emailComparisonHandler;
        emailComparisonHandler = function (event) {
            logCallee("myComparison panel emailComparisonHandler");

            $('#mycomparison-list').hide();

            // Create the Email a colleague popup
            createEmailComparisonView();

            event.preventDefault();
        };
        if (myComparisonItems.length > 0) {
            $("#email-comparison-trigger").show();
            $("#email-comparison-trigger").bind("click", emailComparisonHandler);
        }
        else {
            $("#email-comparison-trigger").hide();
        }

        $("#mycomparison-list-container a#close").bind("click", closeHandler);
        $("#mycomparison-list-container a#clearall").bind("click", clearallHandler);

    }

    function comparisonItemCollectionView() {
        logCallee("comparisonItemCollectionView");
    }

    function propertyScreen() {
        logCallee("propertyScreen");

        // This function builds the subregion screen.

        applicationState.currentScreen = "propertyScreen";

        // Initialise the screen - clear all panels and markers.
        initScreen();

        // Set up the map, attach the property markers, and adjust the viewport appropriately
        setMapToSubregion(applicationState.currentSubregion);

        // Create the search/nav panel
        createSearchPanel();

        // Create the place controls panel
        createPlaceControlsPanel();

        // Create the property info panel
        createPropertyInfoPanel();

        // Create the property list panel
        createPropertyListPanel();

        // Create the testimonial list panel
        createTestimonialListPanel();

        //displays iphone menu content
        $('#city-menu-m').siblings().removeClass('active');
        $('#city-menu-m').addClass('active');

    }

    function homeScreen() {
        logCallee("homeScreen");

        // This function builds the home screen.

        // Initialise the screen - clear all panels and markers.
        initScreen();

        // Create the search/nav panel
        createSearchPanel();

        // Set up the map, attach the city markers, and adjust the viewport appropriately
        setMapToAustralia();

        clearMobileLocationMenu();

        logCallee("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ firstRouteEvent=" + firstRouteEvent);

        // Create the welcome panel
        createCitySelectPanel();

        //Mobile
        $("#iphoneMenu").hide();

        $("#city-select-container").removeClass("geoSlide");

        if (!firstRouteEvent) {
            $("#city-select-container").addClass("iPhoneRemove");
        }

    }

    function clearMobileLocationMenu() {
        $("#iphoneMenu #menu-2-m").hide();
        $('#city-menu-m').siblings().removeClass('active');
        $('#city-menu-m').addClass('active');
    }


    function setMapToAustralia() {
        setMap(new google.maps.LatLng(-28, 134), 4, false);


        //for (var i = 0; i < cities.length; i++) {
        // the following was used instead to place the Canberra city icon on top of Sydney
        //for (var i = cities.length-1; i >-1 ; i--) {
        //    createCityPin(cities.models[i].attributes);
        //}

        // the following was used instead to place the cities in the correct Z-order
        createCityPin(cities.citiesByName("Perth")[0].attributes);
        createCityPin(cities.citiesByName("Adelaide")[0].attributes);
        createCityPin(cities.citiesByName("Brisbane")[0].attributes);
        createCityPin(cities.citiesByName("Sydney")[0].attributes);
        createCityPin(cities.citiesByName("Canberra")[0].attributes);
        createCityPin(cities.citiesByName("Melbourne")[0].attributes);
    }

    function createCityPin(city) {

        logCallee("createCityPin");

        // We only display a city marker if there are properties within that city that satisfy the filtering (Area and Building type) criteria:
        var count = applicationState.filteredProperties.propertiesByCity(city.City).length;

        // If the above is satisfied...
        if (count > 0) {

            // ...then add a marker to the map that represents the city:
            marker = new RegionMarker(new google.maps.LatLng(city.Geo.lat, city.Geo.lng), map, count.toString(), city.City);

            google.maps.event.addListener(marker, 'click', function () {

                logCallee("CityPin click");

                // This function is called when a city pin is clicked. 

                // Set the application state to the selected city:
                applicationState.setStateBasedOnCity(city.City);
                // Trigger a URL change, based on the updated application state:
                navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
            });

            regionPins.push(marker);
        }
    }

    function cityScreen() {
        logCallee("cityScreen");

        // This function builds the city screen.

        // Initialise the screen - clear all panels and markers.
        initScreen();

        // Create the search/nav panel
        createSearchPanel();

        // Set up the map, attach the region markers, and adjust the viewport appropriately
        setMapToCity(applicationState.currentCity);

        if (firstRouteEvent) {
            // Upon load, the user has landed directly on the city screen. We need to slide in the welcome panel
            createCitySelectPanel();
            $("#city-select-container").removeClass("geoSlide");
            //$("#city-select-container").addClass("geoSlide");
        }
        $("#iphoneMenu").show();
        // MOBILE DROPDOWNS - ED
        $('#region-menu-m').siblings().removeClass('active');
        $('#region-menu-m').addClass('active');
    }

    function setMapToCity(city) {

        logCallee("setMapToCity");

        // This function prepares the map for the city screen:
        //  - It attaches markers to the map for each of the regions
        //  - It dimensions the viewport appropriately so that all region markers are visible

        setMap(null);

        maxSouth = Number.POSITIVE_INFINITY;
        maxNorth = Number.NEGATIVE_INFINITY;
        maxWest = Number.POSITIVE_INFINITY;
        maxEast = Number.NEGATIVE_INFINITY;

        if (applicationState.filteredRegions.models.length == 0) {
            setMap(new google.maps.LatLng(city.Geo.lat, city.Geo.lng), 10, false);
        }
        else if (applicationState.filteredRegions.models.length == 1) {
            // If there is only one region we don't need to worry about viewport bounds - just centre the map on the region and set zoom to default 
            setMap(new google.maps.LatLng(city.Geo.lat, city.Geo.lng), 10, false);
            createRegionPin(applicationState.filteredRegions.models[0].attributes);
        }
        else {
            // We need to attach relevant regions to the map - so, iterate through all the relevant regions ...
            for (var i = 0; i < applicationState.filteredRegions.models.length; i++) {

                // Get it's geo information...
                currentGeo = applicationState.filteredRegions.models[i].attributes.Geo;

                // If this region is on the boundary, update the appropriate bound...
                if (currentGeo.lat < maxSouth) { maxSouth = currentGeo.lat }
                if (currentGeo.lng < maxWest) { maxWest = currentGeo.lng }
                if (currentGeo.lat > maxNorth) { maxNorth = currentGeo.lat }
                if (currentGeo.lng > maxEast) { maxEast = currentGeo.lng }

                // Attach a marker to the map that represents the region...
                createRegionPin(applicationState.filteredRegions.models[i].attributes);
            }

            // Create a LatLngBound based on the 4 bounds we have found. All regions should fall within it...

            // The following is for fine adjustment of the viewport. Sometimes the header and footer cut off region pins.
            // This will have the effect of zooming out a bit.
            maxWest -= 0.50 * (maxEast - maxWest);
            maxEast += 0.50 * (maxEast - maxWest);
            maxNorth -= 0.50 * (maxSouth - maxNorth);
            maxSouth += 0.50 * (maxSouth - maxNorth);

            southWest = new google.maps.LatLng(maxSouth, maxWest);
            northEast = new google.maps.LatLng(maxNorth, maxEast);
            bounds = new google.maps.LatLngBounds(southWest, northEast);

            // Attach the LatLngBounds object to the map...
            map.fitBounds(bounds);
        }
    }

    function createRegionPin(region) {

        logCallee("createRegionPin");

        // We only display a region marker if there are properties within that region that satisfy the filtering (Area and Building type) criteria:
        var count = applicationState.filteredProperties.propertiesByRegion(region.Region).length;

        // If the above is satisfied...
        if (count > 0) {

            // ...then add a marker to the map that represents the region:
            marker = new RegionMarker(new google.maps.LatLng(region.Geo.lat, region.Geo.lng), map, "", region.Region);

            google.maps.event.addListener(marker, 'click', function () {

                logCallee("RegionPin click");

                // This function is called when a region marker is clicked. 

                // Set the application state to the selected region:
                applicationState.setStateBasedOnRegion(region.Region);
                // Trigger a URL change, based on the updated application state:
                navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
            });

            regionPins.push(marker);
        }

    }

    function regionScreen() {
        logCallee("regionScreen");

        // This function builds the region screen.

        // Initialise the screen - clear all panels and markers.
        initScreen();

        // Create the search/nav panel
        createSearchPanel();

        // Set up the map, attach the subregion markers, and adjust the viewport appropriately
        setMapToRegion(applicationState.currentRegion);

        if (firstRouteEvent) {
            // Upon load, the user has landed directly on the region screen. We need to slide in the welcome panel
            createCitySelectPanel();
            $("#city-select-container").removeClass("geoSlide");
            //$("#city-select-container").addClass("geoSlide");
        }

        // SET MOBILE TO DISPLAY THE NAVIGATION MENU
        $("#iphoneMenu").show();
        // MOBILE DROPDOWNS - ED
        $('#subregion-menu-m').siblings().removeClass('active');
        $('#subregion-menu-m').addClass('active');
    }

    function setMapToRegion(region) {


        logCallee("setMapToRegion");

        // This function prepares the map for the region screen:
        //  - It attaches markers to the map for each of the subregions
        //  - It dimensions the viewport appropriately so that all subregion markers are visible

        setMap(null);

        maxSouth = Number.POSITIVE_INFINITY;
        maxNorth = Number.NEGATIVE_INFINITY;
        maxWest = Number.POSITIVE_INFINITY;
        maxEast = Number.NEGATIVE_INFINITY;

        if (applicationState.filteredSubregions.models.length == 0) {
            setMap(new google.maps.LatLng(region.Geo.lat, region.Geo.lng), 13, false);
        }
        else if (applicationState.filteredSubregions.models.length == 1) {
            // If there is only one subregion we don't need to worry about viewport bounds - just centre the map on the subregion and set zoom to default 
            setMap(new google.maps.LatLng(region.Geo.lat, region.Geo.lng), 13, false);
            createSubregionPin(applicationState.filteredSubregions.models[0].attributes);
        }
        else {
            // We need to attach relevant subregions to the map - so, iterate through all the relevant subregions ...
            for (var i = 0; i < applicationState.filteredSubregions.models.length; i++) {

                // Get it's geo information...
                currentGeo = applicationState.filteredSubregions.models[i].attributes.Geo;

                // If this subregion is on the boundary, update the appropriate bound...
                if (currentGeo.lat < maxSouth) { maxSouth = currentGeo.lat }
                if (currentGeo.lng < maxWest) { maxWest = currentGeo.lng }
                if (currentGeo.lat > maxNorth) { maxNorth = currentGeo.lat }
                if (currentGeo.lng > maxEast) { maxEast = currentGeo.lng }

                // Attach a marker to the map that represents the subregion...
                createSubregionPin(applicationState.filteredSubregions.models[i].attributes);
            }

            // Create a LatLngBound based on the 4 bounds we have found. All subregions should fall within it...

            // adjust bounds to take into account the panels on the screen
            //maxWest -= 0.30 * (maxEast - maxWest);
            //maxEast += 0.30 * (maxEast - maxWest);
            maxNorth -= 0.20 * (maxSouth - maxNorth);
            maxSouth += 0.20 * (maxSouth - maxNorth);

            southWest = new google.maps.LatLng(maxSouth, maxWest);
            northEast = new google.maps.LatLng(maxNorth, maxEast);
            bounds = new google.maps.LatLngBounds(southWest, northEast);

            // Attach the LatLngBounds object to the map...
            map.fitBounds(bounds);
        }


        //swap above with below if they want to have regions showing ALL sub-region pins.
        //(just like how the sub-region screen shows ALL properties, once you start moving the map around)
        /*
        logCallee("setMapToRegion");

        setMap(null);

        maxSouth = Number.POSITIVE_INFINITY;
        maxNorth = Number.NEGATIVE_INFINITY;
        maxWest = Number.POSITIVE_INFINITY;
        maxEast = Number.NEGATIVE_INFINITY;

        if (applicationState.filteredSubregions.models.length == 0) {
        setMap(eval(region.Geo), 13, false);
        }
        else if (applicationState.filteredSubregions.models.length == 1) {
        setMap(eval(region.Geo), 13, false);
        createSubregionPin(applicationState.filteredSubregions.models[0].attributes);
        }
        //else {
        for (var i = 0; i < subregions.models.length; i++) {

        if (subregions.models[i].attributes.Region == region.Region) {
        currentGeo = eval(subregions.models[i].attributes.Geo);

        if (currentGeo.lat() < maxSouth) { maxSouth = currentGeo.lat() }
        if (currentGeo.lng() < maxWest) { maxWest = currentGeo.lng() }
        if (currentGeo.lat() > maxNorth) { maxNorth = currentGeo.lat() }
        if (currentGeo.lng() > maxEast) { maxEast = currentGeo.lng() }
        }

        createSubregionPin(subregions.models[i].attributes);
        }

        if (applicationState.filteredSubregions.models.length > 1) {
        southWest = new google.maps.LatLng(maxSouth, maxWest);
        northEast = new google.maps.LatLng(maxNorth, maxEast);
        bounds = new google.maps.LatLngBounds(southWest, northEast);
        map.fitBounds(bounds);
        }
        //}
        */

    }

    function createSubregionPin(subregion) {

        logCallee("subregion");

        // We only display a subregion marker if there are properties within that subregion that satisfy the filtering (Area and Building type) criteria:
        var count = applicationState.filteredProperties.propertiesBySubregion(subregion.SubRegion).length;

        // If the above is satisfied...
        if (count > 0) {

            // ...then add a marker to the map that represents the subregion:
            marker = new RegionMarker(new google.maps.LatLng(subregion.Geo.lat, subregion.Geo.lng), map, "", subregion.SubRegion);

            google.maps.event.addListener(marker, 'click', function () {

                logCallee("subregion pin click");

                // This function is called when a subregion marker is clicked. 

                // Set the application state to the selected subregion:
                applicationState.setStateBasedOnSubregion(subregion.SubRegion);
                // Trigger a URL change, based on the updated application state:
                navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
            });

            // Add the pin to the regionPins array:
            regionPins.push(marker);
        }

    }

    function subregionScreen() {
        logCallee("subregionScreen");

        // This function builds the subregion screen.

        // Initialise the screen - clear all panels and markers.
        initScreen();

        // Create the search/nav panel
        createSearchPanel();

        // Create the property list panel
        createPropertyListPanel();

        // Create the place controls panel
        createPlaceControlsPanel();

        // Create the testimonial list panel
        createTestimonialListPanel();

        // Set up the map, attach the property markers, and adjust the viewport appropriately
        setMapToSubregion(applicationState.currentSubregion);

        if (firstRouteEvent) {
            // Upon load, the user has been geolocated directly to the subregion screen. We need to slide in the welcome panel
            createCitySelectPanel();
            $("#city-select-container").addClass("geoSlide");
            firstSubregionRouteEvent = false;
        }
        else {
            // The user has entered the subregion screen for the first time. Show the place control tooltips
            if (firstSubregionRouteEvent) {
                $('#placesTooltip').show();
                firstSubregionRouteEvent = false;
            }
            else {
                $('#placesTooltip').hide();
            }
        }
        $('#city-menu-m').siblings().removeClass('active');
        $('#city-menu-m').addClass('active');

    }

    function setMapToSubregion(subregion) {

        logCallee("setMapToSubregion");

        // This function prepares the map for the subregion screen:
        //  - It attaches markers to the map for each of the properties
        //  - It dimensions the viewport appropriately so that all subregion properties are visible

        setMap(null);

        maxSouth = Number.POSITIVE_INFINITY;
        maxNorth = Number.NEGATIVE_INFINITY;
        maxWest = Number.POSITIVE_INFINITY;
        maxEast = Number.NEGATIVE_INFINITY;

        // we use filteredProperties to populate the map with property pins australia-wide...
        // but we use the below to determine how to dimension the current subregion viewport
        // (filteredProperties is all properties, but filtered by Area type and Building type)
        var localfilteredProperties = new Properties(applicationState.filteredProperties.propertiesBySubregion(subregion.SubRegion));

        if (localfilteredProperties.models.length == 0) {
            setMap(new google.maps.LatLng(subregion.Geo.lat, subregion.Geo.lng), 16, false);
        }

        if (localfilteredProperties.models.length == 1) {
            // If there is only one property we don't need to worry about viewport bounds - just centre the map on the property and set zoom to default 
            setMap(new google.maps.LatLng(localfilteredProperties.models[0].attributes.Geo.lat, localfilteredProperties.models[0].attributes.Geo.lng), 16, false);
        }

        // We need to attach all the properties to the map - so, iterate through all the properties...
        for (var i = 0; i < applicationState.filteredProperties.models.length; i++) {

            // but for any property in the subregion...
            if (applicationState.filteredProperties.models[i].attributes.SubRegion == subregion.SubRegion) {

                // Get it's geo information...
                currentGeo = new google.maps.LatLng(applicationState.filteredProperties.models[i].attributes.Geo.lat, applicationState.filteredProperties.models[i].attributes.Geo.lng);

                // If this property is on the boundary, update the appropriate bound...
                if (currentGeo.lat() < maxSouth) { maxSouth = currentGeo.lat() }
                if (currentGeo.lng() < maxWest) { maxWest = currentGeo.lng() }
                if (currentGeo.lat() > maxNorth) { maxNorth = currentGeo.lat() }
                if (currentGeo.lng() > maxEast) { maxEast = currentGeo.lng() }
            }

            // Attach a marker to the map that represents the property...
            createPropertyPin(applicationState.filteredProperties.models[i].attributes);
        }

        // If there are more than one property in the subregion, we need to make sure the viewport is large enough to display them all. 
        // So we create a LatLngBound based on the 4 bounds we have found. All subregion properties should fall within it...
        if (localfilteredProperties.models.length > 1) {

            // adjust maxWest further to the west to take into account the panels on the LHS of the screen
            //maxWest -= 0.50 * (maxEast - maxWest);
            maxWest -= 0.70 * (maxEast - maxWest);
            maxEast += 0.70 * (maxEast - maxWest);
            maxNorth -= 0.20 * (maxSouth - maxNorth);
            //maxSouth += 0.50 * (maxSouth - maxNorth);

            southWest = new google.maps.LatLng(maxSouth, maxWest);
            northEast = new google.maps.LatLng(maxNorth, maxEast);
            bounds = new google.maps.LatLngBounds(southWest, northEast);

            // Attach the LatLngBounds object to the map...
            map.fitBounds(bounds);
        }

        // turn on the map "bounds_changed" listener, to calculate places information if a "bounds_changed" event occurs:
        boundsChangedHandle = google.maps.event.addListener(map, 'bounds_changed', boundsChangedFunction);
    }

    function boundsChangedFunction() {

        // This function will be called if the following is true:
        //  - There is a listener attached to the map's 'bounds_changed' event 
        //  - The map's viewport bounds have changed, due to the map being dragged or zoomed
        // If both are true, then this function will:
        //  - determine if the number of visible properties within the viewport has changed
        //  - If so, then:
        //      - a new "weighted centre" for the viewport will be calculated 
        //      - places information for the viewport will be re-fetched, based on the new "weighted centre" 

        logCallee('@@@' + map.getZoom());

        // Only re-claculate if we are zoomed in enough...
        if (map.getZoom() > 13) {

            logCallee("boundsChangedFunction called");

            var currentGeo;
            // Get the current map bounds...
            var currentBounds = map.getBounds();
            var currentInsideCount = 0;
            var insideGeos = [];
            var latAvg = 0;
            var lngAvg = 0;
            var length = applicationState.filteredProperties.models.length;
            //logCallee('####### length: '+length);

            // Iterate through all filtered properties ...
            for (var i = 0; i < length; i++) {

                try {

                    // Get geo info for the current property...
                    currentGeo = new google.maps.LatLng(applicationState.filteredProperties.models[i].attributes.Geo.lat, applicationState.filteredProperties.models[i].attributes.Geo.lng);

                    // Is this property currently visible in the viewport?
                    if (currentBounds.contains(currentGeo)) {

                        //logCallee('###### inside: '+properties.models[i].attributes.PropertyName);

                        // If visible, add the current geo object to an array. These objects will be used to calculate a new "weighted centre" for the viewport:
                        currentInsideCount++;
                        insideGeos.push(currentGeo);
                    }
                }
                catch (e) {
                }
            }
            //logCallee('##################### boundsChangedFunction 1 '+currentInsideCount);

            // If there has been a change in the number of properties visible in the viewport...
            if (applicationState.insideCount != currentInsideCount) {

                // Store the current count of visible properties:
                applicationState.insideCount = currentInsideCount;

                if (currentInsideCount == 0) {
                    logCallee('##################### boundsChangedFunction - we now have 0 properties inside the viewport');

                    // There are no properties currently visible in the viewport. Don't do anything - any previously attached place pins will 
                    // remain in place.

                    //initPlacesVars();
                }
                else {
                    logCallee('##################### boundsChangedFunction - we now have ' + applicationState.insideCount + ' properties inside the viewport');

                    // Find the average latitude and average longitude of all the currently visible properties:
                    for (var j = 0; j < insideGeos.length; j++) {
                        latAvg += insideGeos[j].lat();
                        lngAvg += insideGeos[j].lng();
                    }
                    latAvg = latAvg / insideGeos.length;
                    lngAvg = lngAvg / insideGeos.length;

                    // This average will become the new "currentWeightedCentre" - the point we use to request places information from Google Places:
                    currentWeightedCentre = new google.maps.LatLng(latAvg, lngAvg);
                    //logCallee('boundsChangedFunction currentWeightedCentre='+latAvg+" "+lngAvg);

                    // Clear previous place pins:
                    initPlacesVars();

                    // Request places information from Google Places:
                    placesRequestFunction();
                }
            }
        }
        else {

            // We're zoomed out too far. Remove place pins from the map, and reset the counter:
            applicationState.insideCount = 0;
            initPlacesVars();
        }
    }

    function createPropertyPin(property) {

        if ((!isTouch) && (!is_safari)) {
            // Non-safari browsers are able to handle multiple marker (pin) types on the map at once: google.maps.Marker, for places, 
            // and "PropertyMarker" (see declarations at top) for properties. We use these "complex" classes like "PropertyMarker" and "RegionMarker"  
            // to give extra functionality to the pin, like a hover state.
            // Property pins are defined as "PropertyMarker" and we remove these markers using the following:
            marker = new PropertyMarker(new google.maps.LatLng(property.Geo.lat, property.Geo.lng), map, property);
        }
        else {
            // TODO: Safari browsers can only handle one type of marker (pin) on the map at once - google.maps.Marker - for both properties and places. 
            // These markers cannot handle complex behaviour like hover states.
            // Property pins are defined as google.maps.Marker and we remove these markers using the following:
            marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(property.Geo.lat, property.Geo.lng),
                icon: "img/goodman_pointer.png"
            });
        }

        google.maps.event.addListener(marker, 'click', function () {

            logCallee("Property Pin clicked");

            // This function is called when a property pin is clicked. 

            // Set the application state to the selected property:
            applicationState.setStateBasedOnProperty(property);
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });

        });

        // Add the pin to the propertyPins array:
        propertyPins.push(marker);
    }

    function createSearchPanel() {
        logCallee("createSearchPanel");

        // This function handles the Search/Nav panel. 

        // Build the City drop down:
        createCityDDListView();

        // Build the Region drop down:
        createRegionDDListView();

        // Build the Subregion drop down:
        createSubregionDDListView();

        // Build the Building Type drop down:
        createBuildingTypeDDListView();

        // Build the Area Type drop down:
        createAreaDDListView();

        // Create the "contact" button handler and attach it to the "contact" button
        // TODO: this really belongs in createFooterPanel()
        var contactUsHandler;
        contactUsHandler = function (event) {
            logCallee("contactUsHandler");

            // The user has clicked the "contact" button

            //TRACKING - Contact Page  
            _gaq.push(['_trackEvent', 'Contact page', "clicked"]);
            _gaq.push(['_trackPageview', 'vp/Contact page']);

            // First, remove all panels from the screen:
            removePanels();

            // Create the "Contact Us" popup:
            createContactUsPanel();

            if (applicationState.currentProperty) {
                // Reset the application state back to subregion (if in the property screen):
                applicationState.currentProperty = null;
                // Trigger a URL change, based on the updated application state:
                // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
                navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });
            }

            // If we're in the subregion screen we need to re-create the panels below.
            // This is not needed if the user is in any other screen.
            if ((applicationState.currentSubregion) && (applicationState.currentScreen != "route")) {
                createPlaceControlsPanel();
                createPropertyListPanel();
                createTestimonialListPanel();
            }

            event.preventDefault();

        };

        // Create the "about" button handler and attach it to the "about" button
        // TODO: this belongs in createFooterPanel()
        var aboutHandler;
        aboutHandler = function (event) {
            logCallee("aboutHandler");

            // The user has clicked the "about" button

            //TRACKING - About Page  
            _gaq.push(['_trackEvent', 'About page', "clicked"]);
            _gaq.push(['_trackPageview', 'vp/About page']);

            // First, remove all panels from the screen:
            removePanels();

            // Create the "About" popup:
            createAboutPanel();

            if (applicationState.currentProperty) {
                // Reset the application state back to subregion (if in the property screen):
                applicationState.currentProperty = null;
                // Trigger a URL change, based on the updated application state:
                // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
                navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });
            }

            // If we're in the subregion screen we need to re-create the panels below.
            // This is not needed if the user is in any other screen.
            if ((applicationState.currentSubregion) && (applicationState.currentScreen != "route")) {
                createPlaceControlsPanel();
                createPropertyListPanel();
                createTestimonialListPanel();
            }

            event.preventDefault();

        };

        // Create the "home" button handler and attach it to the 2 "home" buttons:
        var homeHandler;
        homeHandler = function (event) {
            logCallee("homeHandler");

            // Note: The sole purpose of this function is to re-display the "home" panel, if we're already on the home screen.
            // If we're not on the home screen, then the default action ("#") will fire, and the home panel will be loaded anyway. 
            if (applicationState.currentScreen == "home") {
                removePanels();

                createCitySelectPanel();
                //if (firstRouteEvent) {
                //    createCitySelectPanel();
                //    $("#city-select-container").removeClass("geoSlide");
                //    //$("#city-select-container").addClass("geoSlide");
                //}

                event.preventDefault();
            }

        };

        // Create the "testimonials" button handler and attach it to the "testimonials" button
        var testimonialItemHandler;
        testimonialItemHandler = function (event) {
            logCallee("testimonialItemHandler");

            //TRACKING - new testimonialItempanel
            _gaq.push(['_trackEvent', 'testimonialItem panel', "clicked"]);
            _gaq.push(['_trackPageview', 'vp/testimonials']);

            // First, remove all panels from the screen:
            removePanels();

            // Create the "Testimonials" popup:
            createTestimonialItemPanel();

            if (applicationState.currentProperty) {
                // Reset the application state back to subregion (if in the property screen):
                applicationState.currentProperty = null;
                // Trigger a URL change, based on the updated application state:
                // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
                navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });
            }

            // If we're in the subregion screen we need to re-create the panels below.
            // This is not needed if the user is in any other screen.
            if ((applicationState.currentSubregion) && (applicationState.currentScreen != "route")) {
                createPlaceControlsPanel();
                createPropertyListPanel();
                createTestimonialListPanel();
            }

            event.preventDefault();

        };

        //if (!isMobile) {
        //    $("#search-container ul#menu li#contact-menu").bind("click", contactUsHandler);
        //    $("#search-container ul#menu li#about-menu").bind("click", aboutHandler);
        //    $("#gmLogo").bind("click", homeHandler);
        //    $("#home-menu").bind("click", homeHandler);
        //    $('#search-container').show();
        //    applicationState.setCrumbs();
        //}
        //else {
        //    $("#contact").bind("click", contactUsHandler);
        //    $("#aboutIphone").bind("click", aboutHandler);
        //    $('#iphoneNavMenu').show();
        //    applicationState.setCrumbs();
        //}


        $("#footer li#contact-menu").bind("click", contactUsHandler);
        $("#footer li#about-menu").bind("click", aboutHandler);

        $("#search-container ul#menu li#testimonial-item").bind("click", testimonialItemHandler);

        $("#gmLogo").bind("click", homeHandler);
        $("#home-menu").bind("click", homeHandler);
        $('#search-container').show();

        $("#contact").bind("click", contactUsHandler);
        $("#aboutIphone").bind("click", aboutHandler);
        //$('#iphoneNavMenu').show();


        applicationState.setCrumbs();


    }

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    this.contactUsValidate = function () {

        // This function is called when the user clicks submit on the Contact Us panel.
        // If the user's input is valid, an ajax call will be made to goodmanwebsite.ws.email.sendMail, and an email will be sent.

        var errorMsg = "";

        //var a = document.getElementById("gbb_sender_first_name").value;

        if (document.getElementById("gbb_sender_first_name").value == "") {
            errorMsg += "<p>please enter your first name</p>";
        }
        if (document.getElementById("gbb_sender_last_name").value == "") {
            errorMsg += "<p>please enter your last name</p>";
        }
        if (document.getElementById("gbb_sender_company").value == "") {
            errorMsg += "<p>please enter your company</p>";
        }
        //var emailPat = /^(\".*\"|[A-Za-z]\w*)@(\[\d{1,3}(\.\d{1,3}){3}]|[A-Za-z]\w*(\.[A-Za-z]\w*)+)$/;
        var emailid = document.getElementById("gbb_sender_email").value;
        //var matchArray = emailid.match(emailPat);
        //if (matchArray == null) {
        if (!validateEmail(emailid)) {
            errorMsg += "<p>please enter a valid email</p>";
        }
        if (document.getElementById("gbb_sender_message").value == "") {
            errorMsg += "<p>please enter your message</p>";
        }

        if (errorMsg != "") {
            document.getElementById("gbbMessage").innerHTML = errorMsg;
            //return false;
        }
        else {

            var ret = goodmanwebsite.ws.email.sendMail(
            document.getElementById("gbb_sender_first_name").value,
            document.getElementById("gbb_sender_last_name").value,
            document.getElementById("gbb_sender_company").value,
            document.getElementById("gbb_sender_email").value,
            //document.getElementById("gbb_sender_subject").value,
            document.getElementById("gbb_sender_message").value,
            OnComplete, OnTimeOut, OnError);

            document.getElementById("gbbMessage").innerHTML = "email sent.";
            //return true;   
        }
    }

    this.emailPropertyValidate = function () {

        // This function is called when the user clicks submit on the Email a colleague panel.
        // If the user's input is valid, an ajax call will be made to goodmanwebsite.ws.email.sendPropertyMail, and an email will be sent.

        var errorMsg = "";

        if (document.getElementById("gbb_ep_recipient_name").value == "") {
            errorMsg += "<p>please enter recipient's name</p>";
        }

        //var emailPat = /^(\".*\"|[A-Za-z]\w*)@(\[\d{1,3}(\.\d{1,3}){3}]|[A-Za-z]\w*(\.[A-Za-z]\w*)+)$/;
        var emailid = document.getElementById("gbb_ep_recipient_email").value;
        //var matchArray = emailid.match(emailPat);
        //if (matchArray == null) {
        if (!validateEmail(emailid)) {
            errorMsg += "<p>please enter a valid recipient email</p>";
        }

        if (document.getElementById("gbb_ep_sender_name").value == "") {
            errorMsg += "<p>please enter your name</p>";
        }

        emailid = document.getElementById("gbb_ep_sender_email").value;
        //matchArray = emailid.match(emailPat);
        //if (matchArray == null) {
        if (!validateEmail(emailid)) {
            errorMsg += "<p>please enter a valid sender email</p>";
        }

        if (errorMsg != "") {
            document.getElementById("gbbMessageEP").innerHTML = errorMsg;
            //return false;
        }
        else {

            //TRACKING - How many emails were sent (to colleagues)
            _gaq.push(['_trackEvent', 'Email a colleague', applicationState.currentProperty.DisplayName]);

            if (firstEventForSession) {
                _gaq.push(['_trackEvent', 'firstEventForSession', 'Email a colleague']);
                firstEventForSession = false;
            }

            var extras = "";

            extras += applicationState.currentProperty.Thumbnail + "|";
            extras += applicationState.currentProperty.PropertyName + "|";
            extras += applicationState.currentProperty.PropertyAddress1 + "|";
            extras += applicationState.currentProperty.SubRegion + "|";
            extras += applicationState.currentProperty.PropertyType + "|";
            extras += applicationState.currentProperty.PropertySize + "|";
            extras += applicationState.currentProperty.Contact1.split(",")[0] + "|";
            extras += applicationState.currentProperty.Contact1.split(",")[1] + "|";
            extras += applicationState.currentProperty.Contact1.split(",")[2] + "|";
            extras += applicationState.currentBaseURL + _basePage + "#displayname=" + applicationState.currentProperty.DisplayName + "";


            var ret = goodmanwebsite.ws.email.sendPropertyMail(
            document.getElementById("gbb_ep_recipient_name").value,
            document.getElementById("gbb_ep_recipient_email").value,
            document.getElementById("gbb_ep_sender_name").value,
            document.getElementById("gbb_ep_sender_email").value,
            document.getElementById("gbb_ep_note").value,
            extras,
            OnCompleteEP, OnTimeOut, OnError);

            document.getElementById("gbbMessageEP").innerHTML = "email sent.";
            //return true;   
        }
    }

    this.emailComparisonValidate = function () {

        // This function is called when the user clicks submit on the Email a colleague panel (my properties).
        // If the user's input is valid, an ajax call will be made to goodmanwebsite.ws.email.sendComparisonMail, and an email will be sent.

        var errorMsg = "";

        if (document.getElementById("gbb_ec_recipient_name").value == "") {
            errorMsg += "<p>please enter recipient's name</p>";
        }

        //var emailPat = /^(\".*\"|[A-Za-z]\w*)@(\[\d{1,3}(\.\d{1,3}){3}]|[A-Za-z]\w*(\.[A-Za-z]\w*)+)$/;
        var emailid = document.getElementById("gbb_ec_recipient_email").value;
        //var matchArray = emailid.match(emailPat);
        //if (matchArray == null) {
        if (!validateEmail(emailid)) {
            errorMsg += "<p>please enter a valid recipient email</p>";
        }

        if (document.getElementById("gbb_ec_sender_name").value == "") {
            errorMsg += "<p>please enter your name</p>";
        }

        emailid = document.getElementById("gbb_ec_sender_email").value;
        //matchArray = emailid.match(emailPat);
        //if (matchArray == null) {
        if (!validateEmail(emailid)) {
            errorMsg += "<p>please enter a valid sender email</p>";
        }

        if (errorMsg != "") {
            document.getElementById("gbbMessageEC").innerHTML = errorMsg;
            //return false;
        }
        else {

            var extras = "";
            var comparisonURL = applicationState.currentBaseURL + _basePage + "#comparison=";

            for (var i = 0; i < myComparisonItems.length; i++) {
                extras += myComparisonItems.models[i].attributes.Thumbnail + "|";
                extras += myComparisonItems.models[i].attributes.PropertyName + "|";
                extras += myComparisonItems.models[i].attributes.PropertyAddress1 + "|";
                extras += myComparisonItems.models[i].attributes.SubRegion + "|";
                extras += myComparisonItems.models[i].attributes.PropertyType + "|";
                extras += myComparisonItems.models[i].attributes.PropertySize + "|";
                extras += myComparisonItems.models[i].attributes.Contact1.split(",")[0] + "|";
                extras += myComparisonItems.models[i].attributes.Contact1.split(",")[1] + "|";
                extras += myComparisonItems.models[i].attributes.Contact1.split(",")[2] + "|";
                extras += applicationState.currentBaseURL + _basePage + "#displayname=" + myComparisonItems.models[i].attributes.DisplayName;
                comparisonURL += myComparisonItems.models[i].attributes.DisplayName;
                if (i < myComparisonItems.length - 1) {
                    extras += "*";
                    comparisonURL += ",";
                }

            }

            //TRACKING - How many emails were sent (to colleagues)
            _gaq.push(['_trackEvent', 'Email a colleague', comparisonURL]);

            if (firstEventForSession) {
                _gaq.push(['_trackEvent', 'firstEventForSession', 'Email a colleague']);
                firstEventForSession = false;
            }

            var ret = goodmanwebsite.ws.email.sendComparisonMail(
            document.getElementById("gbb_ec_recipient_name").value,
            document.getElementById("gbb_ec_recipient_email").value,
            document.getElementById("gbb_ec_sender_name").value,
            document.getElementById("gbb_ec_sender_email").value,
            document.getElementById("gbb_ec_note").value,
            extras,
            comparisonURL,
            OnCompleteEC, OnTimeOut, OnError);

            document.getElementById("gbbMessageEC").innerHTML = "email sent.";
            //return true;   
        }
    }

    function OnComplete(arg) {
        //alert(arg);
        logCallee("email OnComplete: " + arg);
        document.getElementById("gbb_sender_first_name").value = "";
        document.getElementById("gbb_sender_last_name").value = "";
        document.getElementById("gbb_sender_company").value = "";
        document.getElementById("gbb_sender_email").value = "";
        //document.getElementById("gbb_sender_subject").value = "";
        document.getElementById("gbb_sender_message").value = "";
    }

    function OnCompleteEP(arg) {
        //alert(arg);
        logCallee("email OnCompleteEP: " + arg);
        document.getElementById("gbb_ep_recipient_name").value = "";
        document.getElementById("gbb_ep_recipient_email").value = "";
        document.getElementById("gbb_ep_sender_name").value = "";
        document.getElementById("gbb_ep_sender_email").value = "";
        document.getElementById("gbb_ep_note").value = "";
    }

    function OnCompleteEC(arg) {
        //alert(arg);
        logCallee("email OnCompleteEC: " + arg);
        document.getElementById("gbb_ec_recipient_name").value = "";
        document.getElementById("gbb_ec_recipient_email").value = "";
        document.getElementById("gbb_ec_sender_name").value = "";
        document.getElementById("gbb_ec_sender_email").value = "";
        document.getElementById("gbb_ec_note").value = "";
    }

    function OnTimeOut(arg) {
        //alert('timeout');
        logCallee("email OnTimeOut: " + arg);
    }
    function OnError(arg) {
        //alert('error');
        logCallee("email OnError: " + arg);
    }

    function createCitySelectPanel() {
        logCallee("createCitySelectPanel");

        createCitySelectView();

        $('#city-select-container').show();




        // jQuery lightbox plugin - ColorBox v1.3.19.3 - is used for the lightbox
        /*
        $("#city-select-container a.welcomeTestimonial").colorbox({ rel: 'welcomeTestimonial', iframe: true, innerWidth: function () {
        var innerWidth = '500', viewport = $(window).width();
        if (viewport < 767) { innerWidth = '420'; } else if (viewport >= 768) { innerWidth = '700'; }
        return innerWidth;
        },
        innerHeight: function () {
        var innerHeight = '400', viewport = $(window).width();
        if (viewport < 767) { innerHeight = '310'; } else if (viewport >= 768) { innerHeight = '500'; }
        return innerHeight;
        },
        maxWidth: function () {
        var maxWidth = '100%', viewport = $(window).width();
        if (viewport > 960) { maxWidth = '60%'; } else if (viewport >= 768) { maxWidth = '50%'; }
        return maxWidth;
        }
        });
        */




        /*
        allPodTestimonials = [];

        for (var i = 0; i < staffPodTestimonials.models.length; i++) {
        allPodTestimonials.push(staffPodTestimonials.models[i].attributes);
        }

        for (var i = 0; i < testimonialPodTestimonials.models.length; i++) {
        allPodTestimonials.push(testimonialPodTestimonials.models[i].attributes);
        }

        rotateWelcomeVideoCounter = Math.floor(Math.random() * allPodTestimonials.length);
        if (rotateWelcomeVideoCounter === allPodTestimonials.length) rotateWelcomeVideoCounter--;
        rotateWelcomeVideo();

        rotateWelcomeVideoTimerId = setInterval(rotateWelcomeVideo, 5000);
        */

    }

    function hideCitySelectPanel() {
        logCallee("hideCitySelectPanel");

        $('#city-select-container').hide();
        //clearInterval(rotateWelcomeVideoTimerId);

        //$("#city-select-menu a").unbind();
        $("#city-select-container a#close").unbind();

        $("#welcome-testimonial-list a").unbind();


    }


    function createCitySelectView() {
        logCallee("createCitySelectView");

        var citySelectView = new CitySelectView({ model: cities });
        citySelectView.render();

        /*
        var citySelectHandler;
        citySelectHandler = function (event) {
        logCallee("citySelectHandler " + $(event.target).html());

        applicationState.setStateBasedOnCity($(event.target).html());
        navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });

        event.preventDefault();
        };
        $("#city-select-menu a").bind("click", citySelectHandler);
        */

        var closeHandler;
        closeHandler = function (event) {
            logCallee("city-select-container closeHandler");

            //$('#city-select-container').hide();
            hideCitySelectPanel();

            //Mobile
            $("#iphoneMenu").show();

            initMedia();

            event.preventDefault();
        };
        $("#city-select-container a#close").bind("click", closeHandler);

        var startingSlide = Math.floor(Math.random() * allPodTestimonials.length);
        if (startingSlide === allPodTestimonials.length) startingSlide--;

        // jQuery Cycle Lite Plugin is used for the slideshow
        $("#welcome-testimonial-list").cycle({
            fx: 'fade',
            speed: 600,
            startingSlide: startingSlide,
            timeout: 8000
        });


        // Create the "testimonials" panel handler and attach it to each of the videos
        var testimonialItemHandler;
        testimonialItemHandler = function (event) {
            logCallee("testimonialItemHandler");

            //TRACKING - new testimonialItempanel
            _gaq.push(['_trackEvent', 'welcome panel video', "clicked"]);
            _gaq.push(['_trackPageview', 'vp/testimonialsViaWelcomePanel']);

            // First, remove all panels from the screen:
            removePanels();

            // Create the "Testimonials" popup:
            createTestimonialItemPanel();

            if (applicationState.currentProperty) {
                // Reset the application state back to subregion (if in the property screen):
                applicationState.currentProperty = null;
                // Trigger a URL change, based on the updated application state:
                // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
                navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });
            }

            // If we're in the subregion screen we need to re-create the panels below.
            // This is not needed if the user is in any other screen.
            if ((applicationState.currentSubregion) && (applicationState.currentScreen != "route")) {
                createPlaceControlsPanel();
                createPropertyListPanel();
                createTestimonialListPanel();
            }

            event.preventDefault();

        };

        $("#welcome-testimonial-list li").bind("click", testimonialItemHandler);




    }

    function createPropertyInfoPanel() {
        logCallee("createPropertyInfoPanel");

        createPropertyInfoView();

        //Remove class ipadfooter for Ipad landscape view
        $('#property-info-container').show();
        $('#property-info').show();
        $('#footer-container').removeClass('ipadfooter');
    }

    function createGooglePlaceInfoPanel(place) {
        logCallee("createGooglePlaceInfoPanel");

        $('#google-place-info-container').show();

        createGooglePlaceInfoView(place);

    }

    function createGoodmanPlaceInfoPanel(place) {
        logCallee("createGoodmanPlaceInfoPanel");

        $('#goodman-place-info-container').show();

        createGoodmanPlaceInfoView(place);

    }

    function createRtaPlaceInfoPanel(place) {
        logCallee("createRtaPlaceInfoPanel");

        $('#rtacam-place-info-container').show();

        createRtaPlaceInfoView(place);

    }

    function createPropertyInfoView() {
        logCallee("createPropertyInfoView");

        // the property info popup will comprise a model (the collection of data items that populate the panel) and a view (the object that represents the UI)

        // Get the number of comma separated items in the SitePlanImages field of the feed. 
        // If this is zero, use CarouselImages if provided. 
        // Otherwise, don't show the images icon in the property info popup. 
        var ImagesCount = 0;
        if (applicationState.currentProperty.SitePlanImages != "") {
            ImagesCount = applicationState.currentProperty.SitePlanImages.split(",").length;
        }
        else if (applicationState.currentProperty.CarouselImages != "") {
            ImagesCount = applicationState.currentProperty.CarouselImages.split(",").length;
        }

        // Get the number of comma separated items in the VideoURLs field of the feed. If this is zero, don't show the videos icon in the 
        // property info popup. 
        var VideoURLsCount = 0;
        if (applicationState.currentProperty.VideoURLs != "") {
            VideoURLsCount = applicationState.currentProperty.VideoURLs.split(",").length;
        }

        var adjustedProperty = applicationState.currentProperty;
        adjustedProperty.ImagesCount = ImagesCount;
        adjustedProperty.VideoURLsCount = VideoURLsCount;

        // Create the view, and "feed" it the model
        var propertyInfoView = new PropertyInfoView({ model: adjustedProperty });
        propertyInfoView.render();

        // Create the close button handler and attach it to the close button
        var closeHandler;
        closeHandler = function (event) {
            logCallee("property-info panel closeHandler");

            // The user has clicked the property info panel close button

            // Hide the property info panel
            $('#property-info-container').hide();
            $('#property-info').hide();

            // Update application state back to subregion:
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

            event.preventDefault();
        };
        $("#property-info a#close").bind("click", closeHandler);

        // Create the handler that handles the click of the video or image icon, and attach it to the video and image icons
        var galleryHandler;
        galleryHandler = function (event) {
            logCallee("property-info panel galleryHandler");

            //TRACKING - Image galleries
            _gaq.push(['_trackEvent', 'Image gallery', applicationState.currentProperty.DisplayName]);

            if (firstEventForSession) {
                _gaq.push(['_trackEvent', 'firstEventForSession', 'Image gallery']);
                firstEventForSession = false;
            }

            // Close the property info panel
            $('#property-info').hide();

            // Open the gallery panel
            createGalleryView();

            event.preventDefault();
        };

        $(".propertySidebarGallery a").bind("click", galleryHandler);

        // handle gallery links for photos
        logCallee('ImagesCount = ' + ImagesCount);
        if (ImagesCount > 0) {
            $(".propertySidebarOptions #photosLi").bind("click", galleryHandler).show();

            var thumbnails = applicationState.currentProperty.SitePlanImages.split(",").lengh > 0 ? applicationState.currentProperty.SitePlanImages.split(",") : applicationState.currentProperty.CarouselImages.split(",");
            for (var k = 0; k < 2 && k < thumbnails.length; k++) {
                $('<li><img src="' + $.trim(thumbnails[k]) + '" width="400" /></li>').appendTo($('#propertThumbnailPanel #propertThumbnails'));
            }

        }
        else
            $(".propertySidebarOptions #photosLi").hide();

        // handle gallery links for videos
        if (VideoURLsCount > 0)
            $(".propertySidebarOptions #videosLi").bind("click", galleryHandler).show();
        else
            $(".propertySidebarOptions #videosLi").hide();

        // display property lease status
        displayLeaseStatus('.propertySidebarHeader .propertyStatus', applicationState.currentProperty.IsLeased, applicationState.currentProperty.ShowAsNewUntil);
        displayLeaseStatus('.propertyContent #propertyInfoNewOrLeased', applicationState.currentProperty.IsLeased, applicationState.currentProperty.ShowAsNewUntil);

        // The Downloads field in the currentProperty object contains a comma-delimited list of items.
        // Each item consists of an identifier and a URL separated by a pipe ("|").
        // If the identifier contains the word "Brochure" or "brochure", then this item will be listed when you click the brochures button.
        // ...otherwise the item is listed when you click the floorplans button.
        var downloadsArray = [];
        var brochuresArray = [];
        var othersArray = [];

        // If the "Downloads" field has been populated in the feed for the current property, create an array of items from the field...
        if (applicationState.currentProperty.Downloads != "") { downloadsArray = applicationState.currentProperty.Downloads.split(","); }
        // For each of the items...
        for (var i = 0; i < downloadsArray.length; i++) {
            // Extract the identifier and URL...
            var downloadItem = downloadsArray[i];
            var downloadItemIdentifier = $.trim(downloadsArray[i].split("|")[0]);
            var downloadItemURL = $.trim(downloadsArray[i].split("|")[1]);
            // If the identifier contains the string "Brochure" or "brochure"...
            if ((downloadItemIdentifier.indexOf("brochure") != -1) || (downloadItemIdentifier.indexOf("Brochure") != -1) || (downloadItemIdentifier.toLowerCase().indexOf("information memorandum") != -1)) {
                // Add this item to the brochures array...
                brochuresArray.push({ "identifier": downloadItemIdentifier, "url": downloadItemURL });
            }
            else if (downloadItemURL.indexOf(".pdf") != -1) {
                // Else add this item to the "others" array...
                othersArray.push({ "identifier": downloadItemIdentifier, "url": downloadItemURL });
            }
        }

        var multipleDownloadHandler;
        multipleDownloadHandler = function (event) {

            logCallee("property-info panel multipleDownloadHandler");

            // This function handles the situation where there are multiple plans or brochure items.
            // We need to toggle open the panel that displays all the items

            var parent = $(this).parent();

            var html = "";

            if (!parent.siblings().is(":visible")) {
                // If an accordion is open, close it...
                $("#downloadList").hide();
                parent.siblings().show();
                $("#viewOnMapLi").hide();
                if (brochuresArray.length == 0) { $("#brochureLi").hide(); }
                if (othersArray.length == 0) { $("#floorplanLi").hide(); }

                if (ImagesCount == 0) { $(".propertySidebarOptions #photosLi").hide(); }
                if (VideoURLsCount == 0) { $(".propertySidebarOptions #videosLi").hide(); }

            }
            else {

                // The user clicked either the brochures or floorplan button ...
                // If the user clicked on the brochures button AND there are brochures to display...
                if (($(this).attr("class") == "brochureWhiteIcon") && (brochuresArray.length > 0)) {

                    // Build the snippet of HTML to list the items...
                    for (var i = 0; i < brochuresArray.length; i++) {
                        //html += "<li><a href='" + brochuresArray[i].url + "' target='_blank'>" + brochuresArray[i].identifier + "</li>";
                        html += "<li><a href='" + brochuresArray[i].url + "' id='" + brochuresArray[i].identifier + "' target='_blank'>" + brochuresArray[i].identifier + "</a></li>";
                    }
                    $("#downloadList").html(html);
                    $("#downloadList").show();
                    $("#downloadList a").unbind();
                    $("#downloadList a").bind("click", singleDownloadHandler);
                    parent.siblings().hide();
                }
                else if (($(this).attr("class") == "floorplanWhiteIcon") && (othersArray.length > 0)) {

                    // The user clicked on the floorplans button. Show these guys instead...
                    for (var i = 0; i < othersArray.length; i++) {
                        //html += "<li><a href='" + othersArray[i].url + "' target='_blank'>" + othersArray[i].identifier + "</li>";
                        html += "<li><a href='" + othersArray[i].url + "' id='" + othersArray[i].identifier + "' target='_blank'>" + othersArray[i].identifier + "</a></li>";
                    }
                    $("#downloadList").html(html);
                    $("#downloadList").show();
                    $("#downloadList a").unbind();
                    $("#downloadList a").bind("click", singleDownloadHandler);
                    parent.siblings().hide();
                }
                else {
                    // No items matched. Don't do anything
                }
            }

            event.preventDefault();
        };

        var singleDownloadHandler;
        singleDownloadHandler = function (event) {
            //var parent = $(this).parent().get(0);
            //logCallee(parent.id + " clicked " + this.href);
            logCallee("!!!!!!!!!!!!!!!!singleDownloadHandler " + this.id);
            // This function handles the situation where there is only one plan or brochure item.
            // We use a function, instead of directly linking, so that we can add the tracking code below:

            //TRACKING - Downloads
            _gaq.push(['_trackEvent', 'Downloads', applicationState.currentProperty.DisplayName + " " + this.id]);

            if (firstEventForSession) {
                _gaq.push(['_trackEvent', 'firstEventForSession', 'Downloads']);
                firstEventForSession = false;
            }

            return true;
        }

        // Attach the appropriate handler to the "plans" or "brochure" button
        if (brochuresArray.length > 1) {
            $("#brochureLi").show();
            $(".brochureWhiteIcon").bind("click", multipleDownloadHandler);
        }
        else if (brochuresArray.length == 1) {
            $("#brochureLi").show();
            $(".brochureWhiteIcon").attr("href", brochuresArray[0].url);
            $(".brochureWhiteIcon").attr("id", brochuresArray[0].identifier);
            $(".brochureWhiteIcon").bind("click", singleDownloadHandler);
        }
        else {
            $("#brochureLi").hide();
        }

        if (othersArray.length > 1) {
            $("#floorplanLi").show();
            $(".floorplanWhiteIcon").bind("click", multipleDownloadHandler);
        }
        else if (othersArray.length == 1) {
            $("#floorplanLi").show();
            $(".floorplanWhiteIcon").attr("href", othersArray[0].url);
            $(".floorplanWhiteIcon").attr("id", othersArray[0].identifier);
            $(".floorplanWhiteIcon").bind("click", singleDownloadHandler);
        }
        else {
            $("#floorplanLi").hide();
        }

        // Create the handler that processes the "Email a colleague" button click, and attach it to the button
        var emailPropertyHandler;
        emailPropertyHandler = function (event) {
            logCallee("property-info panel emailPropertyHandler");

            $('#property-info').hide();

            createEmailPropertyView();

            event.preventDefault();
        };
        $("#email-property-trigger").bind("click", emailPropertyHandler);

        // Create the handler that processes the "add to my comparison list" button click, and attach it to the button
        var comparisonHandler;
        comparisonHandler = function (event) {
            logCallee("comparisonHandler");

            // Is the current property already in the list? If so, count > 0
            var count = myComparisonItems.itemsByDisplayName(applicationState.currentProperty.DisplayName).length;

            // If the property isn't already in the "my comparison" list, and there are < 4 properties...
            if ((myComparisonItems.models.length < 4) && (count == 0)) {

                //TRACKING - Properties added to My Properties
                _gaq.push(['_trackEvent', 'My Properties', applicationState.currentProperty.DisplayName]);

                if (firstEventForSession) {
                    _gaq.push(['_trackEvent', 'firstEventForSession', 'My Properties']);
                    firstEventForSession = false;
                }

                // Then add the property to the list:
                myComparisonItems.create(applicationState.currentProperty);
                // Update the comparison list count indicator:
                setMyComparisonItemCount(getMyComparisonItemCount());
                $('#my-properties-count').show();
            }

            event.preventDefault();
        };
        $("#property-info a#comparison-add").bind("click", comparisonHandler);

        if ((Modernizr.localstorage) || (Modernizr.sessionstorage)) {
            $('#comparison-add').show();
        }
        else {
            $('#comparison-add').hide();
        }

        // Create the handler that processes a route button click, and attach it to each of the route buttons
        var routeHandler;
        routeHandler = function (event) {
            logCallee("property-info routeHandler");

            //TRACKING - Distance and Routes
            _gaq.push(['_trackEvent', 'Distance and routes', applicationState.currentProperty.DisplayName + ' to ' + this.id]);

            if (firstEventForSession) {
                _gaq.push(['_trackEvent', 'firstEventForSession', 'Distance and routes']);
                firstEventForSession = false;
            }

            // Build a query string that represents this particular route (eg: #route=microsoft-campus,airportSydney)
            var city = applicationState.currentCity.City;
            var routeQueryString = "#route=" + applicationState.currentProperty.DisplayName + ",";

            if (this.id == "custom") {
                // But if the button clicked is the custom route button, toggle the input field into view. Don't navigate anywhere yet
                $('#custom-route-input').toggle();
            }
            else {

                // Complete the query string - append destination and city
                routeQueryString += this.id + city;

                // Trigger a URL change, based on the query string above:
                navigationRouter.navigate(routeQueryString, { trigger: true });

            }

            event.preventDefault();
        };
        $(".property-info-route").bind("click", routeHandler);

        // Calculate distances from this property to the corresponding airport, seaport and city centre, and display them under the appropriate icons
        calculateDistances(new google.maps.LatLng(applicationState.currentProperty.Geo.lat, applicationState.currentProperty.Geo.lng), applicationState.currentCity.City);

        // The following code handles the custom route input field. The following link was used as a guide:
        // https://developers.google.com/maps/documentation/javascript/places#places_autocomplete

        var input = document.getElementById('searchTextField');

        $('#searchTextField').unbind();
        $('#searchTextField').bind('keypress', function (e) {

            // div.pac-container is inserted into the page automatically by google maps
            $('.pac-container').css('z-index', '9999');

            logCallee("searchTextField keypressed=" + e.keyCode);

            // The following is needed to disable the enter key when no valid drop-down item has been selected 
            if (e.keyCode == 13) { e.preventDefault(); }
        });

        // TODO: Restrict autocomplete drop-down items geographically to those within Oz. Note: this doesn't seem to be working properly
        var autocompleteOptions = {
            //types: ['(geocode)'],
            componentRestrictions: { country: "au" }
        };

        // Bind the input field above to the automcomplete functionality
        var autocomplete = new google.maps.places.Autocomplete(input, autocompleteOptions);

        // TODO: Restrict autocomplete drop-down items geographically to those within Oz. Note: this doesn't seem to be working properly
        var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(-43.957589, 112.191063), new google.maps.LatLng(-11.000993, 154.027001));
        autocomplete.setBounds(bounds);

        // Bind to the map
        autocomplete.bindTo('bounds', map);

        // Create the handler that processes the autocompleted address entered by the user.
        google.maps.event.addListener(autocomplete, 'place_changed', function () {

            // Get the selected address
            var place = autocomplete.getPlace();

            if (place.geometry) {

                logCallee("user entered her own route " + place);

                // Build a query string that represents this particular search (eg: #route=microsoft-campus,-33.8571932,151.2044035,24%20Hickson%20Rd%2C%20Millers%20Point...):
                var routeQueryString = "#route=" + applicationState.currentProperty.DisplayName + ",";
                routeQueryString += place.geometry.location.lat() + "," + place.geometry.location.lng() + "," + encodeURIComponent(place.formatted_address);

                // Trigger a URL change, based on the query string above:
                navigationRouter.navigate(routeQueryString, { trigger: true });
            }

        });

        // take care of print
        $('#propertyInfoPrintFooter #propertyUrl').text(applicationState.currentBaseURL + _basePage + "#displayname=" + applicationState.currentProperty.DisplayName);

        if (applicationState.currentProperty.Geo) {
            $('<img src="http://maps.google.com/maps/api/staticmap?size=560x250&zoom=16&sensor=false&markers=icon:http://tinyurl.com/b7455xt|shadow:false|'
                + applicationState.currentProperty.Geo.lat + ',' + applicationState.currentProperty.Geo.lng + '"/>').appendTo($('#propertyInfoPrintGoogleMap'));
        }
        else {
            $('#propertyInfoPrintMoreDetailleft').hide();
        }

        if (othersArray.length > 0)
            $('<li>Building plans</li>').appendTo($('#propertyInfoAvailableOptionPanel #propertyInfoAvailableOptions'));
        if (brochuresArray.length > 0)
            $('<li>Leasing brochure</li>').appendTo($('#propertyInfoAvailableOptionPanel #propertyInfoAvailableOptions'));

        if (ImagesCount > 0)
            $('<li>Images</li>').appendTo($('#propertyInfoAvailableOptionPanel #propertyInfoAvailableOptions'));
        if (VideoURLsCount > 0)
            $('<li>Videos</li>').appendTo($('#propertyInfoAvailableOptionPanel #propertyInfoAvailableOptions'));

        if ($('#propertyInfoAvailableOptionPanel #propertyInfoAvailableOptions li').length == 0)
            $('#propertyInfoAvailableOptionPanel').html('');
    }

    function createGalleryView() {
        logCallee("createGalleryView");

        // The video gallery popup will comprise a model (the collection of data items that populate the panel) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var galleryView = new GalleryView({ model: applicationState.currentProperty });
        galleryView.render();

        var html = "";
        var imagesArray = [];
        var videoURLsArray = [];


        // Images URLs for the property are stored in "CarouselImages", a comma-separated string in the bluearc feed
        if (applicationState.currentProperty.SitePlanImages != "") {
            imagesArray = applicationState.currentProperty.SitePlanImages.split(",");
        }
        else if (applicationState.currentProperty.CarouselImages != "") {
            imagesArray = applicationState.currentProperty.CarouselImages.split(",");
        }

        if (imagesArray.length > 0) {
            $("#galleryPhotoContent").show();
            // Here we manually build the image <li>'s and attach them to the image gallery <ul>.
            for (var i = 0; i < imagesArray.length; i++) {
                html += "<li><a href='" + $.trim(imagesArray[i]) + "' rel='lightbox' class='photo'><img src='" + $.trim(imagesArray[i]) + "' /></a></li>";
            }
            $("#galleryContentList").html(html);
        }
        else {
            $("#galleryPhotoContent").hide();
        }

        html = "";

        // Video URLs for the property are stored in "VideoURLs", a comma-separated string in the bluearc feed
        if (applicationState.currentProperty.VideoURLs != "") {
            videoURLsArray = applicationState.currentProperty.VideoURLs.split(",");
        }

        if (videoURLsArray.length > 0) {
            $("#galleryVideoContent").show();
            // Here we manually build the video <li>'s and attach them to the video gallery <ul>.
            for (var i = 0; i < videoURLsArray.length; i++) {
                html += "<li><a href='http://www.youtube.com/embed/" + videoURLsArray[i] + "?rel=0&wmode=transparent' rel='lightbox' class='youtube'><img src='http://i2.ytimg.com/vi/" + videoURLsArray[i] + "/default.jpg'/></a></li>";
            }
            $("#galleryVideoContentList").html(html);
        }
        else {
            $("#galleryVideoContent").hide();
        }

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("gallery closeHandler");

            // Closing the gallery panel will re-open the property info panel
            $('#gallery').hide();
            $('#property-info').show();

            event.preventDefault();
        };
        $("#gallery a#close").bind("click", closeHandler);

        $('#gallery').show();

        // jQuery lightbox plugin - ColorBox v1.3.19.3 - is used for the lightbox
        $('#gallery a.photo').colorbox({ rel: 'lightbox', maxWidth: function () {
            var maxWidth = '100%', viewport = $(window).width();
            if (viewport > 960) { maxWidth = '70%'; } else if (viewport >= 768) { maxWidth = '80%'; }
            return maxWidth;
        }
        });
        $("#gallery a.youtube").colorbox({ rel: 'lightbox', iframe: true, innerWidth: function () {
            var innerWidth = '500', viewport = $(window).width();
            if (viewport < 767) { innerWidth = '420'; } else if (viewport >= 768) { innerWidth = '700'; }
            return innerWidth;
        },
            innerHeight: function () {
                var innerHeight = '400', viewport = $(window).width();
                if (viewport < 767) { innerHeight = '310'; } else if (viewport >= 768) { innerHeight = '500'; }
                return innerHeight;
            },
            maxWidth: function () {
                var maxWidth = '100%', viewport = $(window).width();
                if (viewport > 960) { maxWidth = '60%'; } else if (viewport >= 768) { maxWidth = '50%'; }
                return maxWidth;
            }
        });
    }

    function createEmailPropertyView() {
        logCallee("createEmailPropertyView");

        // The email property popup will comprise a model (the collection of data items that populate the popup) and a view (the object that represents the UI)

        // Create the model that will be fed into the view
        var adjustedModel = applicationState.currentProperty;
        adjustedModel.PropertyURL = applicationState.currentBaseURL + _basePage + "#displayname=" + applicationState.currentProperty.DisplayName;

        // Create the view, and "feed" it the model
        var emailPropertyView = new EmailPropertyView({ model: adjustedModel });
        emailPropertyView.render();

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("EmailPropertyView closeHandler");

            $('#email-property').hide();

            $('#property-info').show();

            event.preventDefault();
        };
        $("#email-property a#close").bind("click", closeHandler);

        $('#email-property').show();
    }

    function createEmailComparisonView() {
        logCallee("createEmailComparisonView");

        // The email property comparison popup will comprise a model (the collection of data items that populate the popup) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var emailComparisonView = new EmailComparisonView({ model: null });
        emailComparisonView.render();

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("EmailComparisonView closeHandler");

            $('#email-comparison').hide();

            $('#mycomparison-list').show();

            event.preventDefault();
        };
        $("#email-comparison a#close").bind("click", closeHandler);

        $('#email-comparison').show();
    }

    function createGooglePlaceInfoView(currentPlace) {
        logCallee("createGooglePlaceInfoView");

        // the google place popup will comprise a model (the collection of data items that populate the popup) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var placeInfoView = new GooglePlaceInfoView({ model: currentPlace });
        placeInfoView.render();

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("google-place-info panel closeHandler");

            $('#google-place-info-container').hide();

            event.preventDefault();
        };
        $("#google-place-info a#close").bind("click", closeHandler);

    }

    function createGoodmanPlaceInfoView(currentPlace) {
        logCallee("createGoodmanPlaceInfoView");

        // The custom Goodman place popup will comprise a model (the collection of data items that populate the popup) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var placeInfoView = new GoodmanPlaceInfoView({ model: currentPlace });
        placeInfoView.render();

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("goodman-place-info panel closeHandler");

            $('#goodman-place-info-container').hide();

            event.preventDefault();
        };
        $("#goodman-place-info a#close").bind("click", closeHandler);

    }

    function createRtaPlaceInfoView(currentPlace) {
        logCallee("createRtaPlaceInfoView");

        // The RTA popup will comprise a model (the collection of data items that populate the popup) and a view (the object that represents the UI)

        // Create the view, and "feed" it the model
        var placeInfoView = new RtacamPlaceInfoView({ model: currentPlace });
        placeInfoView.render();

        // Create the handler that closes the popup and attach it to the close button.
        var closeHandler;
        closeHandler = function (event) {
            logCallee("rtacam-place-info panel closeHandler");

            $('#rtacam-place-info-container').hide();

            event.preventDefault();
        };
        $("#rtacam-place-info a#close").bind("click", closeHandler);

        // Create the handler that refreshes the RTA feed and attach it to the refresh button.
        var refreshHandler;
        refreshHandler = function (event) {
            logCallee("rtacam-place-info panel refreshHandler");

            $("#rtacam-place-info #view img").attr({ src: currentPlace.href });
        };
        $("#rtacam-place-info #refresh").bind("click", refreshHandler);
    }

    function createTestimonialListPanel() {

        logCallee("createTestimonialListPanel");

        // The "customer pod" testimonial panel will comprise a model (the collection of data items that populate the panel) and a view (the object that represents the UI)

        // Create the collection that will be fed into the view
        var testimonialListView = new TestimonialListView({ model: customerPodTestimonials });
        testimonialListView.render();

        $('#testimonial-list-container').show();

        var startingSlide = Math.floor(Math.random() * customerPodTestimonials.length);
        if (startingSlide === customerPodTestimonials.length) startingSlide--;

        // jQuery Cycle Lite Plugin is used for the slideshow
        $("#testimonial-list").cycle({
            fx: 'fade',
            speed: 600,
            timeout: 10500,
            next: '#nextSlide',
            prev: '#prevSlide',
            startingSlide: startingSlide
        });

        // jQuery lightbox plugin - ColorBox v1.3.19.3 - is used for the lightbox
        $('#testimonial-list-container a.testtestimonialVideo').colorbox({ rel: 'testtestimonial', iframe: true, innerWidth: function () {
            //$('#city-select-container').hide();
            hideCitySelectPanel();

            var innerWidth = '500', viewport = $(window).width();
            if (viewport < 767) { innerWidth = '420'; } else if (viewport >= 768) { innerWidth = '700'; }
            return innerWidth;
        },
            innerHeight: function () {
                var innerHeight = '400', viewport = $(window).width();
                if (viewport < 767) { innerHeight = '310'; } else if (viewport >= 768) { innerHeight = '500'; }
                return innerHeight;
            },
            maxWidth: function () {
                var maxWidth = '100%', viewport = $(window).width();
                if (viewport > 960) { maxWidth = '60%'; } else if (viewport >= 768) { maxWidth = '50%'; }
                return maxWidth;
            }
        });

        var testimonialItemHandler;
        testimonialItemHandler = function (event) {
            logCallee("customerPodTestimonials video clicked " + this.href);

            _gaq.push(['_trackEvent', 'Customer Testimonial Video', "clicked"]);

            event.preventDefault();
        };
        $("#testimonial-list li a").bind("click", testimonialItemHandler);

    }

    function createPropertyListPanel() {
        logCallee("createPropertyListPanel");

        // The property list panel contains 2 views - the property list and the featured list

        // Featured List - This will comprise a model (the collection of featured properties that will populate the list) and a view (the object that represents the UI)
        var featuredListView = new FeaturedListView({ model: applicationState.getFeaturedProperties() });
        featuredListView.render();

        // Property List - This will comprise a model (the collection of properties in this suburb that will populate the list) and a view (the object that represents the UI)
        var propertyListView = new PropertyListView({ model: new Properties(applicationState.filteredProperties.propertiesBySubregion(applicationState.currentSubregion.SubRegion)) });
        propertyListView.render();

        $('#property-list-container').show();

        // Create the handler that handles the user clicking on a list item. This will take the user to the corresponding property screen.
        var propertyInfoHandler;
        propertyInfoHandler = function (event) {
            var propertyString = decodeURIComponent(this.id);

            logCallee("Property list item clicked: " + propertyString);

            // The user selected an item in the property list. 

            // Update application state:
            applicationState.setStateBasedOnProperty(propertyString);
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });

            event.preventDefault();
        };
        $("#property-list li a").bind("click", propertyInfoHandler);

        var featuredInfoHandler;
        featuredInfoHandler = function (event) {
            var propertyString = decodeURIComponent(this.id);

            logCallee("Featured list item clicked: " + propertyString);

            //TRACKING - Properties clicked from 'You may also be interested in'
            _gaq.push(['_trackEvent', 'Featured property', propertyString]);

            if (firstEventForSession) {
                _gaq.push(['_trackEvent', 'firstEventForSession', 'Featured property']);
                firstEventForSession = false;
            }

            // The user selected an item in the featured property list. 

            // Update application state:
            applicationState.setStateBasedOnProperty(propertyString);
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });

            event.preventDefault();
        };
        $("#featured-list li a").bind("click", featuredInfoHandler);
    }

    function createPlaceControlsPanel() {
        logCallee("createPlaceControlsPanel");

        // Create the places control panel. 

        $("#place-controls-container .controller").bind("click", function () {
            logCallee(this.id);

            //TRACKING - Toolbar filters
            _gaq.push(['_trackEvent', 'Filters', this.id]);

            if (firstEventForSession) {
                _gaq.push(['_trackEvent', 'firstEventForSession', 'Filters']);
                firstEventForSession = false;
            }

            var length = placePins.length;
            if ($('#' + this.id).hasClass('off')) {
                // The user clicked a place control that is in the "off" state.

                // show the corresponding place pins:
                for (var i = 0; i < length; i++) {
                    if (placePins[i].grouping_ == this.id) {
                        placePins[i].setMap(map);
                    }
                }

                // Toggle the place control to the "on" state:
                $('#' + this.id).removeClass();
                $('#' + this.id).addClass("controller");
                $('#' + this.id).addClass("button-style");
                $('#' + this.id).addClass(this.id + "WhiteIcon");
            }
            else {
                // The user clicked a place control that is in the "on" state.

                // hide the corresponding place pins:
                for (var i = 0; i < length; i++) {
                    if (placePins[i].grouping_ == this.id) {
                        placePins[i].setMap(null);
                    }
                }

                // Toggle the place control to the "off" state:
                $('#' + this.id).removeClass();
                $('#' + this.id).addClass("controller");
                $('#' + this.id).addClass("button-style");
                $('#' + this.id).addClass(this.id + "WhiteIcon");
                $('#' + this.id).addClass("off");
            }
        });
        $('#place-controls-container').show();
    }

    function createCityDDListView() {
        logCallee("createCityDDListView");

        // The city drop down will comprise a model (the collection of data items that populate the drop down) and a view (the object that represents the UI)

        // Create the collection that will be fed into the view
        var filteredCities = new Cities();
        for (var i = 0; i < cities.models.length; i++) {
            if (applicationState.filteredProperties.propertiesByCity(cities.models[i].attributes.City).length > 0) {
                filteredCities.add(cities.models[i].attributes);
            }
        }

        // Create the views, and "feed" them the models
        var cityDDListView, cityDDListViewM;
        cityDDListViewM = new CityDDListViewM({ model: filteredCities });
        cityDDListViewM.render();
        cityDDListView = new CityDDListView({ model: filteredCities });
        cityDDListView.render();

        // Create the handler that handles the user's selection and attach it to each of the <li> elements
        var cityDDListHandler;
        cityDDListHandler = function (event) {
            var text = $(event.target).text();
            logCallee("cityDDListHandler " + text);

            // The user selected a new city. 

            // Update application state:
            applicationState.setStateBasedOnCity(text);
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
        };
        $("#city-dropdown-menu-m li").bind("click", cityDDListHandler);
        $("#city-dropdown-menu li").bind("click", cityDDListHandler);
    }

    function createRegionDDListView() {
        logCallee("createRegionDDListView");

        // The region drop down will comprise a model (the collection of data items that populate the drop down) and a view (the object that represents the UI)

        // Create the collection that will be fed into the view
        var filteredRegionsMoreStringent = new Regions();
        for (var i = 0; i < applicationState.filteredRegions.models.length; i++) {
            if (applicationState.filteredProperties.propertiesByRegion(applicationState.filteredRegions.models[i].attributes.Region).length > 0) {
                filteredRegionsMoreStringent.add(applicationState.filteredRegions.models[i].attributes);
            }
        }

        // Create the views, and "feed" them the models
        var regionDDListView, regionDDListViewM;
        regionDDListViewM = new RegionDDListViewM({ model: filteredRegionsMoreStringent });
        regionDDListViewM.render();
        regionDDListView = new RegionDDListView({ model: filteredRegionsMoreStringent });
        regionDDListView.render();

        // Create the handler that handles the user's selection and attach it to each of the <li> elements
        var regionDDListHandler;
        regionDDListHandler = function (event) {
            var text = $(event.target).text();
            logCallee("regionDDListHandler " + text);

            // MOBILE DROPDOWNS - ED
            $('#city-menu-m').removeClass('active');
            $('#region-menu-m').removeClass('active');
            $('#subregion-menu-m').addClass('active');

            // The user selected a new region. 

            // Update application state:
            applicationState.setStateBasedOnRegion(text);
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
        };
        $("#region-dropdown-menu-m li").bind("click", regionDDListHandler);
        $("#region-dropdown-menu li").bind("click", regionDDListHandler);
    }

    function createSubregionDDListView() {
        logCallee("createSubregionDDListView");

        // The subregion drop down will comprise a model (the collection of data items that populate the drop down) and a view (the object that represents the UI)

        // Create the collection that will be fed into the view
        var filteredSubregionsMoreStringent = new Subregions();
        for (var i = 0; i < applicationState.filteredSubregions.models.length; i++) {
            if (applicationState.filteredProperties.propertiesBySubregion(applicationState.filteredSubregions.models[i].attributes.SubRegion).length > 0) {
                filteredSubregionsMoreStringent.add(applicationState.filteredSubregions.models[i].attributes);
            }
        }

        // Create the views, and "feed" them the models
        var subregionDDListView, subregionDDListViewM;
        subregionDDListViewM = new SubregionDDListViewM({ model: filteredSubregionsMoreStringent });
        subregionDDListViewM.render();
        subregionDDListView = new SubregionDDListView({ model: filteredSubregionsMoreStringent });
        subregionDDListView.render();

        // Create the handler that handles the user's selection and attach it to each of the <li> elements
        var subregionDDListHandler;
        subregionDDListHandler = function (event) {
            var text = $(event.target).text();
            logCallee("subregionDDListHandler " + text);

            // MOBILE DROPDOWNS - ED
            $('#subregion-menu-m').removeClass('active');
            $('#region-menu-m').removeClass('active');
            $('#city-menu-m').addClass('active');
            $("#iphoneMenu").hide();
            $("#property-list-container").show();

            // The user selected a new subregion. 

            // Update application state:
            applicationState.setStateBasedOnSubregion(text);
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
        };
        $("#subregion-dropdown-menu-m li").bind("click", subregionDDListHandler);
        $("#subregion-dropdown-menu li").bind("click", subregionDDListHandler);
    }

    function createAreaDDListView() {
        logCallee("createAreaDDListView");

        // The area drop down will comprise a model (the collection of data items that populate the drop down) and a view (the object that represents the UI)

        // Create the collection that will be fed into the view
        var filteredAreas = validAreasForThisApplicationState();

        // Create the views, and "feed" them the models
        var areaDDListView, areaDDListViewM;
        areaDDListViewM = new AreaDDListViewM({ model: filteredAreas });
        areaDDListViewM.render();
        areaDDListView = new AreaDDListView({ model: filteredAreas });
        areaDDListView.render();

        // Create the handler that handles the user's selection and attach it to each of the <li> elements
        var areaDDListHandler;
        areaDDListHandler = function (event) {
            var text = $(event.target).text();
            logCallee("areaDDListHandler " + text);

            // The user selected a new Area type. 

            // Update application state:
            applicationState.setStateBasedOnArea(text);
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
        };
        $("#area-dropdown-menu-m li").bind("click", areaDDListHandler);
        $("#iphoneMenu #menu-1-m").show();
        $("#iphoneMenu #menu-2-m").hide();
        $("#area-dropdown-menu li").bind("click", areaDDListHandler);
    }

    function validAreasForThisApplicationState() {
        var filteredAreas = new AreaDDItems();
        filteredAreas.add(areas.areasByName("All")[0].attributes);

        var propertyAreaArray;
        var propertyBuildingTypeArray;

        // to determine what goes into the Area drop down:

        // first we compile a list of all properties that are local:
        var filteredProperties = properties;
        if (applicationState.currentSubregion) filteredProperties = new Properties(filteredProperties.propertiesBySubregion(applicationState.currentSubregion.SubRegion));
        else if (applicationState.currentRegion) filteredProperties = new Properties(filteredProperties.propertiesByRegion(applicationState.currentRegion.Region));

        var length = filteredProperties.length;

        // Iterate through all the local properties...
        for (var i = 0; i < length; i++) {
            var ok = false;
            // now, IF the user selected a building type, filter out irrelevant properties that don't possess that building type: 
            if ((applicationState.currentBuildingType) && (applicationState.currentBuildingType.BuildingTypeName != "All")) {
                propertyBuildingTypeArray = filteredProperties.models[i].attributes.PropertyType.split(",");
                for (var j = 0; j < propertyBuildingTypeArray.length; j++) {
                    if ((applicationState.currentBuildingType.BuildingTypeName == 'Developments') || (applicationState.currentBuildingType.BuildingTypeName == $.trim(propertyBuildingTypeArray[j]))) {
                        ok = true;
                        break;
                    }
                }
            }
            else {
                ok = true;
            }

            if (ok) {
                // if we got to here, the property is valid, meaning any Range type must be included in the drop down:
                propertyAreaArray = filteredProperties.models[i].attributes.PropertyRange.split("|");
                for (var j = 0; j < propertyAreaArray.length; j++) {
                    var areaName = propertyAreaArray[j];
                    if (filteredAreas.areasByName(propertyAreaArray[j]).length == 0) {
                        filteredAreas.add(areas.areasByName(areaName)[0].attributes);
                    }
                }
            }
        }
        return filteredAreas;
    }

    function createBuildingTypeDDListView() {
        logCallee("createBuildingTypeDDListView");

        // The building type drop down will comprise a model (the collection of data items that populate the drop down) and a view (the object that represents the UI)

        // Create the collection that will be fed into the view
        var filteredBuildingTypes = validBuildingTypesForThisApplicationState();

        // Create the views, and "feed" them the models
        var buildingTypeDDListView, buildingTypeDDListViewM;
        buildingTypeDDListViewM = new BuildingTypeDDListViewM({ model: filteredBuildingTypes });
        buildingTypeDDListViewM.render();
        buildingTypeDDListView = new BuildingTypeDDListView({ model: filteredBuildingTypes });
        buildingTypeDDListView.render();

        // Create the handler that handles the user's selection and attach it to each of the <li> elements
        var buildingTypeDDListHandler;
        buildingTypeDDListHandler = function (event) {
            var text = $(event.target).text();
            logCallee("buildingTypeDDListHandler " + text);

            // The user selected a new Building type. 

            // Update application state:
            applicationState.setStateBasedOnBuildingType(text);
            // Trigger a URL change, based on the updated application state:
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: true });
        };
        $("#buildingtype-dropdown-menu-m li").bind("click", buildingTypeDDListHandler);
        $("#iphoneMenu #menu-1-m").show();
        $("#iphoneMenu #menu-2-m").hide();
        $("#buildingtype-dropdown-menu li").bind("click", buildingTypeDDListHandler);
    }

    function validBuildingTypesForThisApplicationState() {
        var filteredBuildingTypes = new BuildingTypeDDItems();
        filteredBuildingTypes.add(buildingtypes.buildingTypesByName("All")[0].attributes);

        var propertyBuildingTypeArray;
        var propertyAreaArray;

        // to determine what goes into the Building Type drop down:

        // first we compile a list of all properties that are local:
        var filteredProperties = properties;
        if (applicationState.currentSubregion) filteredProperties = new Properties(filteredProperties.propertiesBySubregion(applicationState.currentSubregion.SubRegion));
        else if (applicationState.currentRegion) filteredProperties = new Properties(filteredProperties.propertiesByRegion(applicationState.currentRegion.Region));

        var length = filteredProperties.length;

        // Iterate through all the local properties...
        for (var i = 0; i < length; i++) {
            var ok = false;
            // If the user selected a Range (Area) type, filter out irrelevant properties that don't possess that Range (Area) type: 
            if ((applicationState.currentArea) && (applicationState.currentArea.AreaName != "All")) {
                propertyAreaArray = filteredProperties.models[i].attributes.PropertyRange.split("|");
                for (var j = 0; j < propertyAreaArray.length; j++) {
                    if (applicationState.currentArea.AreaName == propertyAreaArray[j]) {
                        ok = true;
                        break;
                    }
                }
            }
            else {
                ok = true;
            }

            if (ok) {
                // if we got to here, the property is valid, meaning any Building Type must be included in the drop down:
                propertyBuildingTypeArray = filteredProperties.models[i].attributes.PropertyType.split(",");
                for (var j = 0; j < propertyBuildingTypeArray.length; j++) {
                    var current = $.trim(propertyBuildingTypeArray[j]);
                    if ((filteredBuildingTypes.buildingTypesByName(current).length == 0) && (current != 'Developments')) {
                        filteredBuildingTypes.add(buildingtypes.buildingTypesByName(current)[0].attributes);
                    }
                }
            }
        }
        return filteredBuildingTypes;
    }

    function initScreen() {

        logCallee("initScreen");

        // When a new URL is loaded, this function is called. It clears the current screen of all it's content:
        //  - panels
        //  - region, subregion, property & place pins

        // Initialize any currently playing videos:
        initMedia();

        // Clear the region & subregion pins:
        for (var i = 0; i < regionPins.length; i++) {
            regionPins[i].remove();
            regionPins[i] = null;
        }
        regionPins = [];

        if ((!isTouch) && (!is_safari)) {
            // Non-safari browsers are able to handle multiple marker (pin) types on the map at once: google.maps.Marker, for places, 
            // and "PropertyMarker" (see declarations at top) for properties. We use these "complex" classes like "PropertyMarker" and "RegionMarker"  
            // to give extra functionality to the pin, like a hover state.
            // Property pins are defined as "PropertyMarker" and we remove these markers using the following:
            for (var i = 0; i < propertyPins.length; i++) {
                propertyPins[i].remove();
                propertyPins[i] = null;
            }
        }
        else {
            // TODO: Safari browsers can only handle one type of marker (pin) on the map at once - google.maps.Marker - for both properties and places. 
            // These markers cannot handle complex behaviour like hover states.
            // Property pins are defined as google.maps.Marker and we remove these markers using the following:
            for (var i = 0; i < propertyPins.length; i++) {
                propertyPins[i].setMap(null);
                propertyPins[i] = null;
            }
        }
        propertyPins = [];

        // Remove place pins:
        initPlacesVars();

        removeSearchPanel();

        removePanels();

        // The subregion screen has a listener that fires in response to changes in the viewport (for the dynamic refresh of place information)
        // This needs to be removed if we navigate to a new screen
        if (boundsChangedHandle) google.maps.event.removeListener(boundsChangedHandle);

    }

    function initMedia() {
        logCallee("initMedia");

        $('#iframe').attr('src', 'http://www.youtube.com/embed/EpPMXg8uwl0')

        //document.getElementById('iframe').contentWindow.location.reload();

        //var ifr = document.getElementById("iframe");
        //ifr.contentWindow.location.replace("");

        //$('#iframe').attr('src', 'http://www.youtube.com/embed/EpPMXg8uwl0');
        // var ifr = document.getElementById("iframe");
        // ifr.contentWindow.location.replace("http://www.youtube.com/embed/hNJM_LxsPmQ");


    }

    function removeSearchPanel() {

        logCallee("removeSearchPanel");

        /******************** NON-MOBILE ************************/

        $('#search-container').hide();

        $("#city-dropdown-menu li").unbind();
        $("#region-dropdown-menu li").unbind();
        $("#subregion-dropdown-menu li").unbind();
        $("#area-dropdown-menu li").unbind();
        $("#buildingtype-dropdown-menu li").unbind();


        $("#footer li#contact-menu").unbind();
        $("#footer li#about-menu").unbind();

        $("#search-container ul#menu li#testimonial-item").unbind();

        $("#gmLogo").unbind();
        $("#home-menu").unbind();

        /******************** MOBILE ************************/

        // RESET DROPDOWNS - ED ------------------------
        // $("#iphoneMenu #menu-1-m").hide();
        // $("#iphoneMenu #menu-2-m").hide();
        //       $('#city-menu-m').siblings().removeClass('active');
        //       $('#city-menu-m').addClass('active');


        $("#city-dropdown-menu-m li").unbind();
        $("#region-dropdown-menu-m li").unbind();
        $("#subregion-dropdown-menu-m li").unbind();
        $("#area-dropdown-menu-m li").unbind();
        $("#buildingtype-dropdown-menu-m li").unbind();

        $("#aboutIphone").unbind();
        $("#contact").unbind();


    }

    function removePanels() {

        logCallee("removePanels");

        $('#place-controls-container').hide();
        $("#place-controls-container .controller").unbind();

        $('#property-list-container').hide();
        $("#property-list li a").unbind();
        $("#featured-list li a").unbind();

        $('#testimonial-list-container').hide();
        $("#testimonial-list li a").unbind();

        $('#property-info-container').hide();

        $('#property-info').hide();
        $("#property-info-route").unbind();
        $("#property-info a#comparison-add").unbind();
        $("#property-info a#close").unbind();
        $("#gallery-trigger").unbind();
        $("#email-property-trigger").unbind();
        $(".brochureWhiteIcon").unbind();
        $(".floorplanWhiteIcon").unbind();
        $('#searchTextField').unbind();
        $("#downloadList a").unbind();
        $(".propertySidebarGallery a").unbind();

        $('#gallery').hide();
        $("#gallery a#close").unbind();

        $('#email-property').hide();
        $("#email-property a#close").unbind();

        $('#email-comparison').hide();
        $("#email-comparison a#close").unbind();

        $('#google-place-info-container').hide();
        $("#google-place-info a#close").unbind();

        $('#goodman-place-info-container').hide();
        $("#goodman-place-info a#close").unbind();

        $('#rtacam-place-info-container').hide();
        $("#rtacam-place-info #refresh").unbind();
        $("#rtacam-place-info a#close").unbind();

        $('#route-info-container').hide();
        $("#route-info-exit").unbind();

        //$('#city-select-container').hide();
        //$("#city-select-menu a").unbind();
        //$("#city-select-container a#close").unbind();
        hideCitySelectPanel();

        $('#mycomparison-list-container').hide();

        $('#mycomparison-list').hide();
        $("#mycomparison-list-container a#close").unbind();
        $("#email-comparison-trigger").unbind();
        $("#mycomparison-list-container a#clearall").unbind();

        $('#comparison-list-container').hide();

        $('#contact-us-container').hide();
        $("#contact-us a#close").unbind();

        $('#about-container').hide();
        $("#about a#close").unbind();

        $('#about-container').hide();
        $("#about a#close").unbind();

        $('#testimonialItem-container').hide();
        $("#testimonialItem a#close").unbind();

        $('.dropdown').hide();

        //MOBILE MENU RESET
        //$("#mobilePropertyDetails").hide();
        //$("#mobileMenuToggle").show();

        $("#navTooltip").hide();
        $("#placesTooltip").hide();
        $("#compareTooltipPanel").hide();

        $(".brochureWhiteIcon").unbind();
        $(".floorplanWhiteIcon").unbind();
        $("#downloadList a").unbind();

        $('.pac-container').remove();


    }

    function initRouter() {
        logCallee("initRouter");

        // Backbone.Router handles the request, and branches accordingly:
        navigationRouter = new NavigationRouter;

        // Backbone provides back-button functionality for single page apps. This following initialises this:
        Backbone.history.start();

    }

    function buildRegions(properties) {
        logCallee("buildRegions");

        var regionArray = new Array();
        var regionObjectArray = new Array();
        var length = properties.models.length;
        var regionIndex = 0;

        // Iterate through the properties...
        for (var i = 0; i < length; i++) {

            // If this property has a "Region" value we haven't seen before...
            if ($.inArray(properties.models[i].attributes.Region, regionArray) == -1) {
                regionIndex++;

                // Add it to the list of previously discovered regions...
                regionArray.push(properties.models[i].attributes.Region);

                // Create a region object and add it to a temporary collection of regions...
                regionObjectArray.push({ "id": regionIndex, "City": properties.models[i].attributes.City, "Region": properties.models[i].attributes.Region, "icon": "img/goodman_pointer.png", Geo: "" });

            }
        }

        length = regionObjectArray.length;

        // Iterate through the temporary collection of regions, adding Geo information to each.
        for (var i = 0; i < length; i++) {

            // "getBoundsCenter" will return a latitude and longitude for the inputted region, based on the "weighted average" of all the properties within it
            regionObjectArray[i].Geo = getBoundsCenter(properties, "region", regionObjectArray[i].Region);
        }

        return regionObjectArray;
    }

    function buildSubRegions(properties) {
        logCallee("buildSubRegions");

        var subregionArray = new Array();
        var subregionObjectArray = new Array();
        var length = properties.models.length;
        var subregionIndex = 0;

        // Iterate through the properties...
        for (var i = 0; i < length; i++) {

            // If this property has a "SubRegion" value we haven't seen before...
            if ($.inArray(properties.models[i].attributes.SubRegion, subregionArray) == -1) {
                subregionIndex++;

                // Add it to the list of previously discovered subregions...
                subregionArray.push(properties.models[i].attributes.SubRegion);

                // Create a subregion object and add it to a temporary collection of subregions...
                subregionObjectArray.push({ "id": subregionIndex, "City": properties.models[i].attributes.City, "SubRegion": properties.models[i].attributes.SubRegion, "Region": properties.models[i].attributes.Region, "icon": "img/goodman_pointer.png", Geo: "" });

            }
        }

        length = subregionObjectArray.length;

        // Iterate through the temporary collection of subregions, adding Geo information to each.
        for (var i = 0; i < length; i++) {

            // "getBoundsCenter" will return a latitude and longitude for the inputted subregion, based on the "weighted average" of all the properties within it
            subregionObjectArray[i].Geo = getBoundsCenter(properties, "subregion", subregionObjectArray[i].SubRegion);
        }

        return subregionObjectArray;
    }

    function getBoundsCenter(properties, searchType, searchString) {
        //logCallee("getBoundsCenter");

        // This function returns the geographical center of a region/subregion. 
        // It does this by 
        //      1: iterating through all the relevant properties
        //      2: retrieving the geographical data for each, and making a note of any property that pushes the existing boundary 
        //      3: calculating a rectangle that contains all the properties (represented by a google.maps.LatLngBounds)
        //      4: returning the center of this rectangle

        var currentGeo;
        var maxSouth = Number.POSITIVE_INFINITY;
        var maxNorth = Number.NEGATIVE_INFINITY;
        var maxWest = Number.POSITIVE_INFINITY;
        var maxEast = Number.NEGATIVE_INFINITY;
        var southWest;
        var northEast;
        var bounds;
        var wLatLng = "null";
        var length = properties.models.length;

        // To get the geographical bounds of a region...
        if (searchType == "region") {

            // Iterate through all the properties...
            for (var i = 0; i < length; i++) {

                // Ignoring properties outside the region...
                if (properties.models[i].attributes.Region == searchString) {

                    // Get the current property's Geo information
                    currentGeo = properties.models[i].attributes.Geo;

                    // If this property is on the boundary, update the appropriate bound...
                    try {
                        if (currentGeo.lat < maxSouth) { maxSouth = currentGeo.lat }
                        if (currentGeo.lng < maxWest) { maxWest = currentGeo.lng }
                        if (currentGeo.lat > maxNorth) { maxNorth = currentGeo.lat }
                        if (currentGeo.lng > maxEast) { maxEast = currentGeo.lng }
                    }
                    catch (e) {
                        logCallee("getBoundsCenter - 1 - Bad Geo data in property=" + properties.models[i].attributes.DisplayName);
                    }
                }
            }

            // Create a LatLngBound based on the 4 bounds we have found. All properties should fall within it
            southWest = new google.maps.LatLng(maxSouth, maxWest);
            northEast = new google.maps.LatLng(maxNorth, maxEast);
            bounds = new google.maps.LatLngBounds(southWest, northEast);
        }

        // To get the geographical bounds of a subregion...
        if (searchType == "subregion") {

            // Iterate through all the properties...
            for (var i = 0; i < length; i++) {

                // Ignoring properties outside the subregion...
                if (properties.models[i].attributes.SubRegion == searchString) {

                    // Get the current property's Geo information
                    currentGeo = properties.models[i].attributes.Geo;

                    // If this property is on the boundary, update the appropriate bound...
                    try {
                        if (currentGeo.lat < maxSouth) { maxSouth = currentGeo.lat }
                        if (currentGeo.lng < maxWest) { maxWest = currentGeo.lng }
                        if (currentGeo.lat > maxNorth) { maxNorth = currentGeo.lat }
                        if (currentGeo.lng > maxEast) { maxEast = currentGeo.lng }
                    }
                    catch (e) {
                        logCallee("getBoundsCenter - 2 - Bad Geo data in property=" + properties.models[i].attributes.DisplayName);
                    }
                }
            }

            // Create a LatLngBound based on the 4 bounds we have found. All properties should fall within it
            southWest = new google.maps.LatLng(maxSouth, maxWest);
            northEast = new google.maps.LatLng(maxNorth, maxEast);
            bounds = new google.maps.LatLngBounds(southWest, northEast);
        }


        // return a LatLng object based on the LatLngBounds we have found
        //if (bounds) wLatLng = "new google.maps.LatLng(" + bounds.getCenter().lat() + "," + bounds.getCenter().lng() + ")";
        if (bounds) wLatLng = { lat: bounds.getCenter().lat(), lng: bounds.getCenter().lng() };

        return wLatLng;
    }

    function loadRTAPlaces() {
        logCallee("loadRTAPlaces");

        rtaPlaces = new RtaPlaces();

        //var url = "http://livetraffic.rta.nsw.gov.au/data-2/traffic-cam.json";
        var url = "traffic-cam.json";
        var location;

        $.getJSON(url, function (data) {

            $.each(data.features, function (i, item) {
                try {

                    var currentItemLocation = new google.maps.LatLng(item.geometry.coordinates[1], item.geometry.coordinates[0]);
                    var currentItemId = i + 1;

                    rtaPlaces.add({ id: currentItemId, rtaid: item.id, type: "rtacam", title: item.properties.title, view: item.properties.view, direction: item.properties.direction, href: item.properties.href, location: currentItemLocation });

                }
                catch (e) {
                    logCallee("!!! ERROR - loadRTAPlaces " + e);
                }
            });
        });
    }

    function getActiveProperties(result) {
        logCallee("################################# IE callback for getActiveProperties ");

        var jsondata = jQuery.parseJSON(result.text);

        buildProperties(jsondata);

        retrievedURLs++;

        if (retrievedURLs == retrieveURLs.length) {
            initRouter();
        }

    }

    function getBBXtras(result) {
        logCallee("################################# IE callback for getBBXtras");

        var jsondata = jQuery.parseJSON(result.text);

        buildBBExtras(jsondata);

        retrievedURLs++;

        if (retrievedURLs == retrieveURLs.length) {
            initRouter();
        }

    }

    // PROPERTY SOURCES
    function loadProperties() {

        logCallee("loadProperties " + applicationState.currentBaseURL);

        retrievedURLs = 0;

        //var datatype = "json";
        var datatype = "text";

        if ($.browser.msie) {

            // THE FOLLOWING CODE HANDLES THE BLUEARC FEED RETRIEVAL WHEN THE CLIENT IS AN INTERNET EXPLORER BROWSER:

            // NOTE: Ran into cross domain issues when retrieving the Goodman feed client-side in IE on staging, even when access was allowed on server side.
            // I didn't have this problem in the other browsers, using jQuery (see below).
            // Also, can't seem to use jQuery for retrieving data in IE - NOW RESOLVED.
            // Tried using window.XDomainRequest, but this was not reliable.
            // So, the solution for IE was:
            //  - A web service was built that retrieves the Goodman feed (ie7handler.asmx). 
            //  - If the GBB domain is the same as the Goodman feed domain (production environment), then retrieve the feed directly, similar to other
            //      browsers.
            //  - If the domains are different (staging, localhost, etc), then retrieve the feed from ie7handler.asmx.
            //  - the HTTP object (below) will determine the appropriate data fetch method (XMLHttpRequest or ActiveXObject, etc), depending on IE version.

            if ((window.location.hostname.indexOf("au.goodman.com") != -1) || (window.location.hostname.indexOf("www.goodman.com") != -1)) {

                // GBB production environment - fetch the Goodman feed directly using jQuery

                //// The following is the "old-school" way to fetch the feed...
                //HTTP.getXML("http://" + window.location.hostname + "/services/integrationservices.asmx/GetActiveProperties?countrycode=au", getActiveProperties);
                //HTTP.getXML("http://" + window.location.hostname + "/services/integrationservices.asmx/GetBBXtras?countrycode=au", getBBXtras);

                // URLs below are used by the "new-school" jQuery way to fetch the feed (essentially the same thing as above, but with a jQuery wrapper)...
                // IE is fussy about the domain of the feed URL
                retrieveURLs = ["http://" + window.location.hostname + "/services/integrationservices.asmx/GetActiveProperties?countrycode=au", "http://" + window.location.hostname + "/services/integrationservices.asmx/GetBBXtras?countrycode=au"];

            }
            else {
                //use below to fetch a local copy of GetActiveProperties.json:
                //retrieveURLs = [applicationState.currentBaseURL + "GetActiveProperties.json", applicationState.currentBaseURL + "ws/ie7handler.asmx/GetBBXtras"];
                // Used for localhost and staging. Fetch using ie7handler.asmx:
                // TODO: doesn't seem to work for localhost<port no.>. Why? cross-domain restrictions?
                retrieveURLs = [applicationState.currentBaseURL + "ws/ie7handler.asmx/GetActiveProperties", applicationState.currentBaseURL + "ws/ie7handler.asmx/GetBBXtras"];
            }

        }
        else {

            // THE FOLLOWING CODE HANDLES THE BLUEARC FEED RETRIEVAL WHEN THE CLIENT IS NOT AN INTERNET EXPLORER BROWSER:

            // Non-IE browsers don't seem to be as fussy about the URL domain as IE. Also, we fetch the live feed regardless of domain, 
            // for the sake of other devs in the team who may not have ie7handler.asmx
            //retrieveURLs = [applicationState.currentBaseURL + "GetActiveProperties.json", "http://www.goodman.com/services/integrationservices.asmx/GetBBXtras?countrycode=au"];
            //use the one below to test compression on localhost
            //retrieveURLs = [applicationState.currentBaseURL + "ws/ie7handler.asmx/GetActiveProperties", applicationState.currentBaseURL + "ws/ie7handler.asmx/GetBBXtras"];


            retrieveURLs = ["http://www.goodman.com/services/integrationservices.asmx/GetActiveProperties?countrycode=au", "http://www.goodman.com/services/integrationservices.asmx/GetBBXtras?countrycode=au"];

        }

        // The following was used to see if compression was working on the Goodman server:
        //retrieveURLs = [applicationState.currentBaseURL + "ws/ie7handler.asmx/GetActiveProperties", applicationState.currentBaseURL + "ws/ie7handler.asmx/GetBBXtras"];

        // Fetch each of the feeds listed in retrieveURLs, asynchronously...
        for (var i = 0; i < retrieveURLs.length; i++) {

            $.ajax({
                url: retrieveURLs[i],
                dataType: datatype,
                data: {},
                async: true,
                success: (function (thisURL) {
                    return function (data) {
                        // create a new closure on the parameter thisURL which holds the correct value

                        logCallee("loadProperties callback " + thisURL);

                        //TODO: not sure why but this block of codes is stopping rendering on IE so commented out for now
                        var jsonblob = $.trim($(data).text());
                        /*var jsonblob;
                        if (($.browser.msie) && (parseInt($.browser.version, 10) === 8) && (thisURL.indexOf("GetActiveProperties") != -1)) {
                        // $.text() doesn't work on IE8 (it was stripping out whitespace in the pdf filenames) so we use the following hack)
                        //see: http://stackoverflow.com/questions/8803186/jquery-html-and-text-removing-extra-whitespace-in-ie7-ie8
                        logCallee("*** IE8 get XML data hack ***");
                        jsonblob = $.trim(data.substring(data.indexOf("http://www.goodman.com") + 25, data.indexOf("</string>")));
                        }
                        else {
                        jsonblob = $.trim($(data).text());
                        }*/

                        //logCallee("???????????????????????????????????? " + jsonblob);
                        var jsondata = jQuery.parseJSON(jsonblob);

                        //logCallee("???????????????????????????????????? " + jsondata);
                        if (thisURL.indexOf("GetActiveProperties") != -1) {

                            // The bluearc property feed has returned. Build the properties, regions and subregions collections from it...
                            buildProperties(jsondata);

                            retrievedURLs++;
                        }

                        if (thisURL.indexOf("GetBBXtras") != -1) {

                            // The bluearc BBXtras feed has returned. Build the BBXtras collection from it...
                            buildBBExtras(jsondata);

                            retrievedURLs++;
                        }

                        // Once we've received all the feeds listed in retrieveURLs, we are now reader to initiate the Backbone router and start
                        // processing the original request and render the page...
                        if (retrievedURLs == retrieveURLs.length) {
                            initRouter();
                        }

                    };
                } (retrieveURLs[i])), // calling the function with the current value        
                error: (function (thisURL) {
                    return function (data) {

                        logCallee("!!!ERROR - loadProperties callback $.ajax error: " + data.statusText + " for URL=" + thisURL);

                    };
                } (retrieveURLs[i]))
            });
        }

    }

    function localJSONEnabled() {
        if (!_localPropertyJSON || !_localBBXtrasJSON) return false;
        try { eval(_localPropertyJSON); } catch (e) { return false }
        try { eval(_localBBXtrasJSON); } catch (e) { return false }
        return true;
    }

    function loadPropertiesLocally() {

        logCallee("loadPropertiesLocally");

        var activeProperties = eval(_localPropertyJSON);
        //logCallee("???????????????????????????????????? " + activeProperties);
        logCallee("activeProperties.length = " + activeProperties.length);
        buildProperties(activeProperties);

        var BBXtras = eval(_localBBXtrasJSON);
        //logCallee("???????????????????????????????????? " + BBXtras);
        logCallee("BBXtras.length = " + BBXtras.length);
        buildBBExtras(BBXtras);

        initRouter();

    }

    function buildBBExtras(jsondata) {
        logCallee("buildBBExtras");

        // "BBXtras" is a Backbone Collection. Feed the constructor a JSON array and it will return the corresponding array of bbxtras objects.
        // Backbone collections also provide handy methods for filtering and sorting the javascript objects
        bbxtras = new BBXtras(jsondata);

        //for (var i = 0; i < bbxtras.models.length; i++) {
        //
        //    logCallee(bbxtras.models[i].attributes.Title,bbxtras.models[i].attributes.TypePrimary,bbxtras.models[i].attributes.TypeSecondary,bbxtras.models[i].attributes.TypeTertiary);
        //    logCallee(bbxtras.models[i].attributes.Content);
        //
        //    logCallee(" ");
        //}

        var rawTestimonials = bbxtras.bbxtrasByTypePrimary("testimonial");
        var rawTestimonial, testimonial, tmp, decoded;

        customerPodTestimonials = new Testimonials();
        testimonialPodTestimonials = new Testimonials();
        staffPodTestimonials = new Testimonials();

        // iterate through the raw testimonial objects, cleaning the data in each and creating brand new customerPodTestimonials and
        // testimonialPodTestimonials collections
        for (var i = 0; i < rawTestimonials.length; i++) {

            rawTestimonial = rawTestimonials[i].attributes;

            // Content in the Goodman CMS is stored as HTML. The following hack strips out the tags:
            tmp = document.createElement("DIV");
            tmp.innerHTML = rawTestimonial.Content;
            decoded = tmp.textContent || tmp.innerText;

            // We have to do it twice to get the raw data. The above only converts escaped characters to html tags:
            tmp = document.createElement("DIV");
            tmp.innerHTML = decoded;
            decoded = tmp.textContent || tmp.innerText;

            testimonial = { "id": rawTestimonial.TypeTertiary, "url": decoded.split("|")[0], "blurb": decoded.split("|")[1] };

            // "customerpod" testimonials live in the small slideshow at bottom-left and open up in a slideshow
            if (rawTestimonial.TypeSecondary === "customerpod") {
                customerPodTestimonials.add(testimonial);
            }

            // "testimonialpod" testimonials live in the Testimonial Video panel and open up in a slideshow
            else if (rawTestimonial.TypeSecondary === "testimonialpod") {
                testimonialPodTestimonials.add(testimonial);
            }

            // "staffpod" testimonials live in the Testimonial Video panel and open up in a slideshow
            else if (rawTestimonial.TypeSecondary === "staffpod") {
                staffPodTestimonials.add(testimonial);
            }
        }

        // Temporary:
        //testimonial = { "id": "1", "url": "endWFUDsumw", "blurb": "Sydney South" };
        //staffPodTestimonials.add(testimonial);
        //testimonial = { "id": "2", "url": "ZkOy2ow4S5k", "blurb": "Sydney West" };
        //staffPodTestimonials.add(testimonial);
        //testimonial = { "id": "3", "url": "OpOj467a4m8", "blurb": "Sydney North" };
        //staffPodTestimonials.add(testimonial);

        // All pod testimonials are used on the Welcome panel
        allPodTestimonials = [];

        for (var i = 0; i < staffPodTestimonials.models.length; i++) {
            allPodTestimonials.push(staffPodTestimonials.models[i].attributes);
        }

        for (var i = 0; i < testimonialPodTestimonials.models.length; i++) {
            allPodTestimonials.push(testimonialPodTestimonials.models[i].attributes);
        }


    }

    function buildProperties(jsondata) {
        logCallee("buildProperties");

        // "Properties" is a Backbone Collection. Feed the constructor a JSON array and it will return the corresponding array of property objects.
        // Backbone collections also provide handy methods for filtering and sorting the javascript objects
        properties = new Properties(jsondata);

        var geoString;
        var geoArray;
        var newGeo;

        // Iterate through the property objects to set the "Geo" and "City" fields:
        for (var i = 0; i < properties.models.length; i++) {

            geoString = "-25.50818448289275,133.95463650512693";
            if (properties.models[i].attributes.Geo) {
                geoString = properties.models[i].attributes.Geo;
            }
            else {
                logCallee("buildProperties - 1 - Bad Geo data in property=" + properties.models[i].attributes.DisplayName);
                continue;
            }

            // The "Geo" information attached to each property in the feed needs to be converted from a string into an object containing latitude and longitude 
            // information...
            geoArray = geoString.split(",");
            newGeo = { lat: $.trim(geoArray[0]), lng: $.trim(geoArray[1]) };

            // ...this will be placed into the property object...
            properties.models[i].attributes.Geo = newGeo;

            // Use the "Region" field to create the "City" field of each property object ...
            if (properties.models[i].attributes.Region.indexOf("Sydney") != -1) { properties.models[i].attributes.City = "Sydney"; }
            if (properties.models[i].attributes.Region.indexOf("Melbourne") != -1) { properties.models[i].attributes.City = "Melbourne"; }
            if (properties.models[i].attributes.Region.indexOf("Brisbane") != -1) { properties.models[i].attributes.City = "Brisbane"; }
            if (properties.models[i].attributes.Region.indexOf("Perth") != -1) { properties.models[i].attributes.City = "Perth"; }
            if (properties.models[i].attributes.Region.indexOf("Adelaide") != -1) { properties.models[i].attributes.City = "Adelaide"; }
            if (properties.models[i].attributes.Region.indexOf("Canberra") != -1) { properties.models[i].attributes.City = "Canberra"; }

            // remove unwanted area range
            if (properties.models[i].attributes.PropertyRange) {
                var areaList = properties.models[i].attributes.PropertyRange.split('|');
                var newRange = '';
                var lastReached = false;
                for (var j = 0; j < areaList.length; j++) {
                    if ((areaList[j] == '2,501 to 5,000 sqm') || (areaList[j] == '5,001 to 10,000 sqm') || (areaList[j] == '10,000+ sqm')) {
                        if (!lastReached)
                            newRange += (j > 0 ? '|' : '') + lastAreaName;
                    }
                    else {
                        newRange += (j > 0 ? '|' : '') + areaList[j];
                    }
                }
                properties.models[i].attributes.PropertyRange = newRange;
            }
        }

        // Create the regions collection by "combing" the properties collection for all unique "Region" field values ...
        regions = new Regions(buildRegions(properties));

        // Create the subregions collection by "combing" the properties collection for all unique "SubRegion" field values ...
        subregions = new Subregions(buildSubRegions(properties));

        // Use the "Region" field to create the "City" field of each region object ...
        for (var i = 0; i < regions.models.length; i++) {
            try {
                if (regions.models[i].attributes.Region.indexOf("Sydney") != -1) { regions.models[i].attributes.City = "Sydney"; }
                if (regions.models[i].attributes.Region.indexOf("Melbourne") != -1) { regions.models[i].attributes.City = "Melbourne"; }
                if (regions.models[i].attributes.Region.indexOf("Brisbane") != -1) { regions.models[i].attributes.City = "Brisbane"; }
                if (regions.models[i].attributes.Region.indexOf("Perth") != -1) { regions.models[i].attributes.City = "Perth"; }
                if (regions.models[i].attributes.Region.indexOf("Adelaide") != -1) { regions.models[i].attributes.City = "Adelaide"; }
                if (regions.models[i].attributes.Region.indexOf("Canberra") != -1) { regions.models[i].attributes.City = "Canberra"; }
            }
            catch (e) {
                logCallee("buildProperties - 2 - Bad region");
            }
        }

        // Use the "Region" field to create the "City" field of each subregion object ...
        for (var i = 0; i < subregions.models.length; i++) {
            try {
                if (subregions.models[i].attributes.Region.indexOf("Sydney") != -1) { subregions.models[i].attributes.City = "Sydney"; }
                if (subregions.models[i].attributes.Region.indexOf("Melbourne") != -1) { subregions.models[i].attributes.City = "Melbourne"; }
                if (subregions.models[i].attributes.Region.indexOf("Brisbane") != -1) { subregions.models[i].attributes.City = "Brisbane"; }
                if (subregions.models[i].attributes.Region.indexOf("Perth") != -1) { subregions.models[i].attributes.City = "Perth"; }
                if (subregions.models[i].attributes.Region.indexOf("Adelaide") != -1) { subregions.models[i].attributes.City = "Adelaide"; }
                if (subregions.models[i].attributes.Region.indexOf("Canberra") != -1) { subregions.models[i].attributes.City = "Canberra"; }
            }
            catch (e) {
                logCallee("buildProperties - 3 - Bad subregion");
            }
        }
    }

    function loadGoodmanPlaces() {

        goodmanPlaces = new GoodmanPlaces();

        var query = "SELECT name,category,location,description FROM 3631271";
        query = encodeURIComponent(query);
        var gvizQuery = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + query);

        gvizQuery.send(function (response) {

            logCallee("loadGoodmanPlaces " + response);

            var numRows = response.getDataTable().getNumberOfRows();

            for (var i = 0; i < numRows; i++) {

                var currentItemName = response.getDataTable().getValue(i, 0);

                var currentItemType = response.getDataTable().getValue(i, 1);

                var stringCoordinates = response.getDataTable().getValue(i, 2);
                var splitCoordinates = stringCoordinates.split(' ');
                var lat = splitCoordinates[0];
                var lng = splitCoordinates[1];
                var currentItemLocation = new google.maps.LatLng(lat, lng);

                var currentItemDescription = response.getDataTable().getValue(i, 3);

                var currentItemId = i + 1;

                goodmanPlaces.add({ id: currentItemId, name: currentItemName, type: currentItemType, description: currentItemDescription, location: currentItemLocation });
            }

        });

    }

    function createCollections() {

        logCallee("createCollections");

        // Load property data from the Bluearc feed
        if (!localJSONEnabled())
            loadProperties();

        // Load custom place information from Google fusion tables (not used in this release)
        //loadGoodmanPlaces();

        // Load traffic camera information from a snapshot of the RTA feed kept in the top-level applicaton folder 
        // (traffic-cam.json, screen-scraped from http://livetraffic.rta.nsw.gov.au/desktop.html)
        loadRTAPlaces();

        // The following will be use to load city pins on the Home page
        cities = new Cities([
        { "id": 1, "City": "Sydney", "Geo": { lat: -33.86623, lng: 151.20730} },
        { "id": 2, "City": "Melbourne", "Geo": { lat: -37.813866522309176, lng: 144.9630231170654} },
        { "id": 3, "City": "Brisbane", "Geo": { lat: -27.470904852093124, lng: 153.02355741548536} },
        { "id": 4, "City": "Adelaide", "Geo": { lat: -34.92884252760139, lng: 138.60007767963407} },
        { "id": 5, "City": "Perth", "Geo": { lat: -31.95294655204655, lng: 115.8574826030731} },
        { "id": 6, "City": "Canberra", "Geo": { lat: -35.18823918841276, lng: 149.07354061889646} }
        ]);

        // The following will be used to populate the Area type drop-down
        areas = new AreaDDItems([
        { "id": 1, "AreaName": "All" },
        { "id": 2, "AreaName": "Less than 500 sqm" },
        { "id": 3, "AreaName": "501 to 1,000 sqm" },
        { "id": 4, "AreaName": "1,001 to 2,500 sqm" },
        //{ "id": 5, "AreaName": "2,501 to 5,000 sqm" },
        //{ "id": 6, "AreaName": "5,001 to 10,000 sqm" },
        //{ "id": 7, "AreaName": "10,000+ sqm" }
        {"id": 5, "AreaName": lastAreaName }
        ]);

        // The following will be used to populate the Building type drop-down
        buildingtypes = new BuildingTypeDDItems([
        { "id": 1, "BuildingTypeName": "All" },
        { "id": 2, "BuildingTypeName": "Industrial" },
        { "id": 3, "BuildingTypeName": "Commercial" }
        //{ "id": 4, "BuildingTypeName": "Developments" }
        ]);

    }

    this.init = function () {

        // Start here! This is called once the DOM is loaded...

        logCallee("init");

        initWidgits();

        createCollections();

        initializeMap();

        if (localJSONEnabled())
            loadPropertiesLocally();
    }

    function placesRequestFunction() {

        logCallee("placesRequestFunction");

        //goodmanPlacesRequestFunction();

        googlePlacesRequestFunction();

        rtaPlacesRequestFunction();
    }

    function rtaPlacesRequestFunction() {

        logCallee("rtaPlacesRequestFunction");

        // This function attaches pins representing RTA traffic camers to the map.

        var currentPlaceLocation;

        // Iterate through all the RTA feed objects:
        for (var i = 0; i < rtaPlaces.length; i++) {

            // Get the camera's location:
            currentPlaceLocation = rtaPlaces.models[i].attributes.location;

            //logCallee("currentWeightedCentre: "+currentWeightedCentre.lat()+" "+currentWeightedCentre.lng()+" ... currentPlaceLocation: "+rtaPlaces.models[i].attributes.name+" "+currentPlaceLocation.lat()+" "+currentPlaceLocation.lng());

            // If the camera's location falls within a certain radius of the viewport's "weighted centre", attach a pin on the map:
            if ((Math.abs(currentWeightedCentre.lat() - currentPlaceLocation.lat()) < 0.012) && (Math.abs(currentWeightedCentre.lng() - currentPlaceLocation.lng()) < 0.012)) {
                createRtaPlacePin(rtaPlaces.models[i].attributes);
            }
        }

    }

    function goodmanPlacesRequestFunction() {

        logCallee("goodmanPlacesRequestFunction");

        // This function attaches pins representing Goodman custom places to the map (not used in this release)

        var currentPlaceLocation;

        for (var i = 0; i < goodmanPlaces.length; i++) {
            currentPlaceLocation = goodmanPlaces.models[i].attributes.location;

            if ((Math.abs(currentWeightedCentre.lat() - currentPlaceLocation.lat()) < 0.012) && (Math.abs(currentWeightedCentre.lng() - currentPlaceLocation.lng()) < 0.012)) {
                createGoodmanPlacePin(goodmanPlaces.models[i].attributes);
            }
        }

    }

    function createRtaPlacePin(place) {

        //rtaPlaceMarker = new PlaceMarker("rtacam", map, place);

        // Add a pin to the map:
        rtaPlaceMarker = new google.maps.Marker({
            map: map,
            position: place.location,
            icon: "img/" + placeTypesObject[place.type].icon,
            type_: place.type,
            grouping_: placeTypesObject[place.type].grouping
        });

        google.maps.event.addListener(rtaPlaceMarker, 'click', function () {

            logCallee("RTA place pin clicked - " + place.title + " id=" + place.id);

            // This function is called when an RTA pin is clicked. 

            // First, remove all panels from the screen:
            removePanels();

            // Create the RTA popup:
            createRtaPlaceInfoPanel(place);

            // Reset the application state back to subregion (if in the property screen):
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

            // Add the following panels:
            createPlaceControlsPanel();
            createPropertyListPanel();
            createTestimonialListPanel();

        });

        // Add the pin to the placePins array. This allows us to make group updates to the pins, eg: toggling visibility via the place control buttons
        placePins.push(rtaPlaceMarker);

    }

    function createGoodmanPlacePin(place) {

        // Not used in this release.

        //goodmanPlaceMarker = new PlaceMarker("goodmanplace", map, place);
        goodmanPlaceMarker = new google.maps.Marker({
            map: map,
            position: place.location,
            icon: "img/" + placeTypesObject[place.type].icon,
            type_: place.type,
            grouping_: placeTypesObject[place.type].grouping
        });

        google.maps.event.addListener(goodmanPlaceMarker, 'click', function () {

            logCallee("Goodman place pin clicked - " + place.name + " id=" + place.id);

            removePanels();

            createGoodmanPlaceInfoPanel(place);

            applicationState.currentProperty = null;
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

            createPlaceControlsPanel();
            createPropertyListPanel();
            createTestimonialListPanel();

        });

        placePins.push(goodmanPlaceMarker);

    }

    function googlePlacesRequestFunction() {

        logCallee("googlePlacesRequestFunction");

        // This function requests places information from Google Places. It is called:
        //  1: when the subregion screen is loaded.
        //  2: when the user drags the map, and there is a change in the number of properties in the viewport. This changes the 
        //  "weighted centre" of the vieport, and a corresponding re-fresh of places information needs to take place.

        // Temporarily remove the map drag listener, while we retrieve places information
        if (boundsChangedHandle) google.maps.event.removeListener(boundsChangedHandle);
        //logCallee("turned boundsChangedHandle off "+boundsChangedHandle);

        var currentTypeArray;

        // A number of async requests are sent to Google Places requesting places information.
        for (var i = 0; i < placesRequestCountMax; i++) {

            currentTypeArray = [];

            // For each request, Google expects an array of place types. Don't put all the place types in one request - spread them over several requests.
            // Google only sends ~20 place objects back per request.

            if (i == 0) {
                // All the eating-type places were put into their own request:
                currentTypeArray.push("restaurant");
                currentTypeArray.push("bar");
                currentTypeArray.push("cafe");
            }
            else if (i == 1) {
                currentTypeArray.push("atm");
                currentTypeArray.push("parking");
            }
            else if (i == 2) {
                // Each of the place types below return very few, if any, places. They can be bundled together:
                currentTypeArray.push("university");
                currentTypeArray.push("gas_station");
                currentTypeArray.push("hospital");
                currentTypeArray.push("post_office");
                currentTypeArray.push("train_station");
                currentTypeArray.push("airport");
                currentTypeArray.push("gym");
                currentTypeArray.push("bus_station");
                currentTypeArray.push("movie_theater");
            }
            else if (i == 3) {
                currentTypeArray.push("shopping_mall");
                currentTypeArray.push("store");
            }

            logCallee("placesRequestFunction " + currentWeightedCentre + " " + currentTypeArray.join());

            placesRequest = {
                location: currentWeightedCentre,
                radius: 1000,
                types: currentTypeArray
            };

            // Send the request to Google Places. "googlePlacesRequestCallback" will handle the response:
            placesService.search(placesRequest, googlePlacesRequestCallback);
        }
    }

    function googlePlacesRequestCallback(results, status) {

        //logCallee("#################################googlePlacesRequestCallback "+results.length);

        var currentArray;

        // We just received a response from Google Places. "results" holds an array of place objects, each satisfying the requirements of the request:
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {

                var location = results[i].geometry.location;

                // For each place object returned by Google Places, process it and attach a corresponding pin to the map:
                createGooglePlacePin(results[i]);
            }
        }

        placesRequestCount++;

        // Once we've received responses from Google Places for all our places requests, we once again turn on the map "bounds_changed" listener, 
        // to re-calculate places information if a "bounds_changed" event occurs.
        if (placesRequestCount == placesRequestCountMax) {
            boundsChangedHandle = google.maps.event.addListener(map, 'bounds_changed', boundsChangedFunction);
        }

    }

    function createGooglePlacePin(place) {

        //logCallee("!!!!!!!!!!!!! "+place.name+" "+place.types.join());
        var placeTypesArrayLength = placeTypesArray.length;
        var currentTypesArrayLength = place.types.length;
        var currentType = "";

        //we may need the following line of code if we ever convert to coffeescript. coffescript cannot handle breakpoint labels
        //var breakout = false;
        outerloop:

        // The purpose of this loop is to determine the "type" (eg: restaurant or whatever) of the place object returned from Google Places.
        // Google Places may attach several types to the returned object (place.types), but for the sake of simplicity, we override this with 
        // the first matching type from our internal list of types (placeTypesArray).
        for (var i = 0; i < placeTypesArrayLength; i++) {
            for (var j = 0; j < currentTypesArrayLength; j++) {
                if (placeTypesArray[i] == place.types[j]) {
                    currentType = placeTypesArray[i];

                    break outerloop;
                    //we may need the following lines of code if we ever convert to coffeescript. coffescript cannot handle breakpoint labels
                    //breakout = true;
                    //break;
                }
            }
            //we may need the following lines of code if we ever convert to coffeescript. coffescript cannot handle breakpoint labels
            //if (breakout)
            //{
            //  break;
            //}
        }

        //googlePlaceMarker = new PlaceMarker("googleplace", map, place);

        // Add a pin to the map:
        googlePlaceMarker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: "img/" + placeTypesObject[currentType].icon,
            type_: currentType,
            grouping_: placeTypesObject[currentType].grouping
        });

        google.maps.event.addListener(googlePlaceMarker, 'click', function () {

            logCallee("Google place pin clicked - " + place.name + " id=" + place.reference);

            // This function is called when a place pin is clicked. 

            //TRACKING - Places Pins
            _gaq.push(['_trackEvent', 'Places Pins', place.name]);
            _gaq.push(['_trackPageview', "vp/Places Pins: " + place.name]);

            // First, prepare a request object to Google Places for more information about this place:
            var request = {
                reference: place.reference
            };

            // Send the request to Google Places:
            var service = new google.maps.places.PlacesService(map);
            service.getDetails(request, function (place, status) {

                // We have just received a response from Google Places for more information about the current place:
                if (status == google.maps.places.PlacesServiceStatus.OK) {

                    // Remove all panels from the screen:
                    removePanels();

                    // Add the following panels:
                    createPlaceControlsPanel();
                    createPropertyListPanel();
                    createTestimonialListPanel();

                    var adjustedPlace = place;
                    place.type = currentType;

                    // Create the place popup:
                    createGooglePlaceInfoPanel(adjustedPlace);

                }
            });

            // Reset the application state back to subregion (if in the property screen):
            applicationState.currentProperty = null;
            // Trigger a URL change, based on the updated application state:
            // (trigger=false tells Backbone to only change the URL in the address bar, not a full change via Backbone.Router)
            navigationRouter.navigate(applicationState.getRouteForThisState(), { trigger: false });

        });

        // Add the pin to the placePins array. This allows us to make group updates to the pins, eg: toggling visibility via the place control buttons
        placePins.push(googlePlaceMarker);
    }

    function handleDirectionRequest(origin, destination) {
        logCallee("handleDirectionRequest " + arguments);

        calcRoute(origin, destination);
        $('#property-info-container').hide();
        $('#property-info').hide();
    }

    function calcRoute(origin, destination) {

        // This function handles routing requests to new google.maps.DirectionsService(). 
        // Responses are rendered as coloured routing paths on a map by directionsDisplay
        // (a google.maps.DirectionsRenderer() object)

        logCallee("calcRoute " + arguments);

        if (origin != destination) {
            var directionsRequest = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.DirectionsTravelMode.DRIVING,
                unitSystem: google.maps.DirectionsUnitSystem.METRIC,
                provideRouteAlternatives: false
            };
            directionsDisplay.setMap(map);
            directionsService.route(directionsRequest, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    //map.setMapTypeId("uncluttered");
                }
            });
        }
    }
    function calculateDistances(origin, destination) {

        // This function handles requests to google.maps.DistanceMatrixService() 
        // Responses are handled by calculateDistancesCallback()

        for (var i = 0; i < routeArray.length; i++) {
            routeArray[i] = null;
            routeNameArray[i] = null;
        }
        routeArray = [];
        routeNameArray = [];

        if (applicationState.currentScreen == "route") {
            routeArray.push(destination.address);
        }
        else {
            routeObject = {
                pointA: locations["airport" + destination],
                pointB: locations["city" + destination],
                pointC: locations["seaport" + destination]
            };
            for (var name in routeObject) {
                routeArray.push(routeObject[name].address);
                routeNameArray.push(routeObject[name].title);
            }
            logCallee("calculateDistances " + routeArray.join());

            distanceBlurb = "";
        }

        distanceService.getDistanceMatrix(
    {
        //origins: [origin1, origin2],
        origins: [origin],
        destinations: routeArray,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    }, calculateDistancesCallback);

    }

    function calculateDistancesCallback(response, status) {

        logCallee("calculateDistancesCallback " + arguments);

        if (status != google.maps.DistanceMatrixStatus.OK) {

            //alert('Error was: ' + status);
            logCallee('Error was: ' + status);

        } else {

            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;

            if (applicationState.currentScreen == "route") {
                var results = response.rows[0].elements;
                if (results[0].status === "OK") $("#distance-blurb-custom").html(results[0].distance.text);
            }
            else {
                var ulWidth = $('#property-info .propertyContent ul.propertyDistances').width();
                var liWidth = $('#property-info .propertyContent ul.propertyDistances li.propertyDistanceItem').width() + 2;
                var customInputWidth = $('#property-info .propertyContent ul.propertyDistances li#custom-route-input input').width();
                logCallee('ulWidth = ' + ulWidth + ', liWidth = ' + liWidth);

                var visibleCount = 0;
                for (var i = 0; i < origins.length; i++) {
                    var results = response.rows[i].elements;
                    for (var j = 0; j < results.length; j++) {
                        // TODO: put all "distanceBlurbs" for all properties into an array...
                        //distanceBlurb+="Distance to "+routeNameArray[j]+": "+results[j].distance.text+" ("+results[j].duration.text+")<br />";
                        if (results[j].status === "OK") {

                            // show only if the distance is within the allowed maximum distance in km
                            if (results[j].distance.value < _maxRouteDistance * 1000) {
                                $("#distance-blurb-" + j).html(results[j].distance.text);
                                $("#distance-blurb-" + j).parent().parent('li').show();
                                visibleCount++;
                            }
                        }
                    }
                }

                // reset the width for the ul
                var newUlWidth = ulWidth + liWidth * visibleCount;
                $('#property-info .propertyContent ul.propertyDistances').width(newUlWidth);

                // for some reason, calculated margin for the input is not working so fixed one...
                if (visibleCount != 3)
                    $('#property-info .propertyContent ul.propertyDistances li#custom-route-input input').width(newUlWidth - 23);

                // change only when at least one route is hidden
                if (visibleCount == 0)
                    $('#property-info .propertyContent ul.propertyDistances').attr('class', 'propertyDistances propertyDistancesNoRoute');

                //$("#distance-blurb").html(distanceBlurb);
            }
        }
    }

    function initializeMap() {

        // Here we initialise variables and Google maps services that will be used throughout the application.

        logCallee("initializeMap " + arguments);

        // The following is used to display routes and distances to landmarks
        locations = {
            newtown: { title: "Newtown", Geo: { lat: -33.89737, lng: 151.17894 }, address: "327 King Street, Newtown, NSW" },
            walshbay: { title: "Walsh Bay", Geo: { lat: -33.855, lng: 151.203 }, address: "24 Hickson Road, Sydney, NSW, Australia" },
            central: { title: "central", Geo: { lat: -33.88303, lng: 151.20624 }, address: "Central Station, Sydney, NSW, Australia" },
            airportSydney: { title: "airport", Geo: { lat: -33.93636, lng: 151.16656 }, address: "Mascot Airport, Sydney, NSW, Australia" },
            citySydney: { title: "city", Geo: { lat: -33.86623, lng: 151.20730 }, address: "1 Martin Place, Sydney, NSW, Australia" },
            seaportSydney: { title: "seaport", Geo: { lat: -33.96245530190917, lng: 151.2142974643707 }, address: "Foreshore Road, Sydney, NSW, Australia" },
            airportMelbourne: { title: "airport", Geo: { lat: -37.67164066783794, lng: 144.8513573913574 }, address: "Melbourne Airport, Tullamarine, Victoria, Australia" },
            cityMelbourne: { title: "city", Geo: { lat: -37.813866522309176, lng: 144.9630231170654 }, address: "1 Bourke Street, Melbourne, Victoria, Australia" },
            seaportMelbourne: { title: "seaport", Geo: { lat: -37.84528829101906, lng: 144.9147004394531 }, address: "Williamstown Road, Melbourne, Victoria, Australia" },
            airportBrisbane: { title: "airport", Geo: { lat: -27.3847732878235, lng: 153.11739449787137 }, address: "Brisbane Airport, Brisbane, Queensland, Australia" },
            cityBrisbane: { title: "city", Geo: { lat: -27.470904852093124, lng: 153.02355741548536 }, address: "George Street, Brisbane, Queensland, Australia" },
            seaportBrisbane: { title: "seaport", Geo: { lat: -27.39377073650812, lng: 153.16407029914853 }, address: "Port Drive, Brisbane, Queensland, Australia" },
            airportAdelaide: { title: "airport", Geo: { lat: -34.93437514066293, lng: 138.54083304691312 }, address: "Adelaide Airport, Adelaide, South Australia, Australia" },
            cityAdelaide: { title: "city", Geo: { lat: -34.92884252760139, lng: 138.60007767963407 }, address: "Grote Street, Adelaide, South Australia, Australia" },
            seaportAdelaide: { title: "seaport", Geo: { lat: -34.83812578421272, lng: 138.50272958564756 }, address: "Port River Expressway, Port Adelaide, South Australia, Australia" },
            airportCanberra: { title: "airport", Geo: { lat: -35.30726896048644, lng: 149.19020598220823 }, address: "Canberra Airport, Canberra, Australia Capital Territory, Australia" },
            cityCanberra: { title: "city", Geo: { lat: -35.27885701418874, lng: 149.13084735560415 }, address: "34 East Row, Canberra, Australian Capital Territory, Australia" },
            seaportCanberra: { title: "seaport", Geo: { lat: -33.96245530190917, lng: 151.2142974643707 }, address: "Foreshore Road, Sydney, NSW, Australia" },
            airportPerth: { title: "airport", Geo: { lat: -31.9416583, lng: 115.9734909 }, address: "Perth International Airport, Perth, Western Australia, Australia" },
            cityPerth: { title: "city", Geo: { lat: -31.95294655204655, lng: 115.8574826030731 }, address: "96 William Street, Perth, Western Australia, Australia" },
            seaportPerth: { title: "seaport", Geo: { lat: -32.04766686851078, lng: 115.73522751617429 }, address: "1 Cliff Street, Fremantle, Western Australia, Australia" }
        };

        // Initialise the distance service that will be used in the property info panel to display distances to landmarks 
        distanceServiceInit();

        // Initialise the routing service that will be used in the property info panel to display routes to landmarks   
        directionsServiceInit();

        //trafficLayerInit();
    }

    function setMap(center, inZoom, fixZoom, minZoomLevel, maxZoomLevel) {

        // This function sets the Map object to a particular location, with a particular set of attributes (zoom level, tools, etc).

        logCallee("setMap " + arguments);

        pinkParkStyleMapType = new google.maps.StyledMapType(pinkParkStyle, { name: "Pink Parks" });
        blueRoadStyleMapType = new google.maps.StyledMapType(blueRoadStyle, { name: "Blue Roads" });
        desaturatedStyleMapType = new google.maps.StyledMapType(desaturatedStyle, { name: "Desaturated" });
        unclutteredStyleMapType = new google.maps.StyledMapType(unclutteredStyle, { name: "Uncluttered" });
        unclutteredStyleMapType2 = new google.maps.StyledMapType(unclutteredStyle2, { name: "Uncluttered2" });
        unclutteredStyleMapType3 = new google.maps.StyledMapType(unclutteredStyle3, { name: "Uncluttered3" });

        //var panControl = !isTouch;

        mapOptions = {
            /*
            mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'pink_parks', 'blue_roads', 'desaturated', 'uncluttered']
            },
            */
            zoom: inZoom,
            center: center,
            //mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeId: 'uncluttered3',
            //mapTypeId: inMapStyle,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            //panControl: !isTouch,
            panControl: false,
            panControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            disableDoubleClickZoom: true
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        map.mapTypes.set('pink_parks', pinkParkStyleMapType);
        map.mapTypes.set('blue_roads', blueRoadStyleMapType);
        map.mapTypes.set('desaturated', desaturatedStyleMapType);
        map.mapTypes.set('uncluttered', unclutteredStyleMapType);
        map.mapTypes.set('uncluttered2', unclutteredStyleMapType2);
        map.mapTypes.set('uncluttered3', unclutteredStyleMapType3);
        //map.setMapTypeId('pink_parks');

        // TODO: adjust the zoom control to reflect the fact that zooming is constrained
        if (fixZoom) {
            zoomHandle = google.maps.event.addListener(map, 'zoom_changed', function () {
                if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
                if (map.getZoom() > maxZoomLevel) map.setZoom(maxZoomLevel);
            });
        }
        else {
            zoomHandle = google.maps.event.addListener(map, 'zoom_changed', function () {
                if (map.getZoom() < 5) map.setZoom(5);
            });
        }


        clickHandle = google.maps.event.addListener(map, 'click', function (event) {

            logCallee("map clickHandler");

            $('.dropdown').hide();

            $("#navTooltip").hide();
            $("#placesTooltip").hide();
            $("#compareTooltipPanel").hide();

        });


        boundsHandle = google.maps.event.addListener(map, 'center_changed', function () { checkBounds(); });

        placesService = new google.maps.places.PlacesService(map);
    }

    function checkBounds() {
        if (!allowedBounds.contains(map.getCenter())) {
            var C = map.getCenter();
            var X = C.lng();
            var Y = C.lat();

            var AmaxX = allowedBounds.getNorthEast().lng();
            var AmaxY = allowedBounds.getNorthEast().lat();
            var AminX = allowedBounds.getSouthWest().lng();
            var AminY = allowedBounds.getSouthWest().lat();

            if (X < AminX) { X = AminX; }
            if (X > AmaxX) { X = AmaxX; }
            if (Y < AminY) { Y = AminY; }
            if (Y > AmaxY) { Y = AmaxY; }

            map.setCenter(new google.maps.LatLng(Y, X));
        }
    }

    function distanceServiceInit() {

        logCallee("distanceServiceInit " + arguments);

        distanceService = new google.maps.DistanceMatrixService();
    }

    function trafficLayerInit() {

        logCallee("trafficLayerInit " + arguments);

        trafficLayer = new google.maps.TrafficLayer();
    }

    function directionsServiceInit() {

        logCallee("directionsServiceInit " + arguments);

        directionsService = new google.maps.DirectionsService();
        var polylineOptionsActual = new google.maps.Polyline({
            strokeColor: '#77ac1c',
            strokeOpacity: 0.5,
            strokeWeight: 10
        });
        var rendererOptions = {
            suppressMarkers: true,
            polylineOptions: polylineOptionsActual
            //draggable: true
            //preserveViewport:true
        };
        directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    }

    function initPlacesVars() {

        // This function clears all the place markers from the map.

        logCallee("initPlacesVars " + placePins.length);

        placesRequestCount = 0;

        for (var i = 0; i < placePins.length; i++) {
            placePins[i].setMap(null);
            //placePins[i].remove();
            placePins[i] = null;
        }
        placePins = [];

        $("#place-controls-container .controller").removeClass("off");
    }

    function initWidgits() {

        // Here we initialise drop-downs, 3rd-party widgits, etc.

        //Menu show and hide
        $("a.dropdown-toggle").bind('click', function (event) {
            event.preventDefault();
            $("#menu .dropdown").fadeOut(100);
            var target = $(this).parent().find(".dropdown");
            $(target).fadeIn(50);
            $("#menu .dropdown .dropdown-menu li").bind('click', function () {
                $("#menu .dropdown").fadeOut(100);
            });
        });
        // SHOW AND HIDE Iphone Menu
        $("a#mobileMenuToggle").click(function () {
            $("#iphoneMenu").toggle();
        });
        //Show and hide map
        $("a#mobilePropertyDetails").click(function () {
            $("#property-info-container").removeClass('hidden');
            $("#property-list-container").removeClass('hidden');
            $(this).hide();
            $("#mobileMenuToggle").show();
        });
        //Start button in the welcome message panel
        $("a#getStartedButton").click(function () {
            //$("#city-select-container").hide();
            hideCitySelectPanel();
            $("#headerMenu #navTooltip").show();
            $("#placesTooltip").show();
            $("#compareTooltipPanel").show();
            $("#iphoneMenu").show();
        });
        //Close tooltips with the close button
        $("#navTooltipContent #close").click(function () {
            $("#navTooltip").hide();
            $("#placesTooltip").hide();
            $("#compareTooltipPanel").hide();
        });
        //Show map from property panel iPhone
        $("#property-info-container a#viewOneMapLink").live("click", function () {
            $("#property-info-container").addClass('hidden');
            $("#property-list-container").addClass('hidden');
            $("#mobilePropertyDetails").show();
            $("#mobileMenuToggle").hide();
        });
        //show filter menu iPhone
        $("#iphoneMenu #filter").click(function () {
            $("#iphoneMenu #menu-1-m").hide();
            $("#iphoneMenu #menu-2-m").show();
        });
        //show location menu iPhone
        $("#iphoneMenu #location").click(function () {
            $("#iphoneMenu #menu-1-m").show();
            $("#iphoneMenu #menu-2-m").hide();
        });
        //show and hide terms and conditions     
        $("#termsConditionsHeader").live("click", function () {
            $("#about .aboutMainBlurb").toggle();
            $("#termsConditionsContent").toggle();
            $("#termsConditionsHeader #statusHandle .arrowUp").toggle();
            $("#termsConditionsHeader #statusHandle .arrowDown").toggle();
        });

        //$("#testimonial-list").cycle({
        //    fx: 'fade',
        //    speed: 'fast',
        //    timeout: 0,
        //    next: '#nextSlide',
        //    prev: '#prevSlide'
        //});
    }

    function getDateAvailableSnippet(item) {
        var output = '';
        if (item.PropertyType.indexOf("Industrial") !== -1) {
            if ((item.DateAvailableIndustrial) && (item.DateAvailableIndustrial !== ""))
                output = item.DateAvailableIndustrial;
        }
        if (item.PropertyType.indexOf("Commercial") !== -1) {
            if ((item.DateAvailableCommercial) && (item.DateAvailableCommercial !== ""))
                output = item.DateAvailableCommercial;
        }
        if (item.PropertyType.indexOf("Developments") !== -1) {
            if ((item.DateAvailableDevelopment) && (item.DateAvailableDevelopment !== ""))
                output = item.DateAvailableDevelopment;
        }
        return output;
    }

    function getOtherSnippet(item) {
        var output = '';
        if (item.PropertyType.indexOf("Industrial") !== -1) {
            if ((item.WarehouseClearanceHeight) && (item.WarehouseClearanceHeight !== ""))
                output += "<li>Warehouse Clearance Height: " + item.WarehouseClearanceHeight + "</li>";
            if ((item.Docks) && (item.Docks !== ""))
                output += "<li>Docks: " + item.Docks + "</li>";
            if ((item.HardstandArea) && (item.HardstandArea !== "") && (item.HardstandArea !== "False"))
                output += "<li>Hardstand Area: Yes</li>";
        }
        if (item.PropertyType.indexOf("Commercial") !== -1) {
            if ((item.FitOut) && (item.FitOut !== "") && (item.FitOut !== "False"))
                output += "<li>Fitout: Yes</li>";
            if ((item.ParkingRatio) && (item.ParkingRatio !== ""))
                output += "<li>Parking Ratio: " + item.ParkingRatio + "</li>";
            if ((item.SignageOpportunities) && (item.SignageOpportunities !== "") && (item.SignageOpportunities !== "False"))
                output += "<li>Signage Opportunities: Yes</li>";
        }
        if (item.PropertyType.indexOf("Developments") !== -1) {
            if ((item.DAApproval) && (item.DAApproval !== "") && (item.DAApproval !== "False"))
                output += "<li>DA Approval: Yes</li>";
            if ((item.Type) && (item.Type !== ""))
                output += "<li>Type: " + item.Type + "</li>";
            if ((item.Zoning) && (item.Zoning !== ""))
                output += "<li>Zoning: " + item.Zoning + "</li>";
            if ((item.Activity) && (item.Activity !== ""))
                output += "<li>Activity: " + item.Activity + "</li>";
            if ((item.Infrastructure) && (item.Infrastructure !== ""))
                output += "<li>Infrastructure: " + item.Infrastructure + "</li>";
        }
        return output;
    }

    // append amenity icons to the given container
    function displayAmenity(amenities, container) {
        if (amenities) {
            // define the list of amenities here
            // NOTE: 
            // because the amenity name in the feeds has space and apostrophe, we need another static array for the names
            // the length and order of the following two arrays should be the same
            var _amenityValues = ["Childcare", "Cafe", "Gym", "Parking"];
            var _amenityNames = ["Childcare", "On-site Café", "Gym", "Parking"];

            var amenityList = amenities.split(",");
            for (var i = 0; i < amenityList.length; i++) {
                // we want to display only the defined amenitiesities
                var amenity = $.trim(amenityList[i]);
                for (var j = 0; j < _amenityNames.length; j++) {
                    if (_amenityNames[j] == amenity) {

                        $('<span class="tooltipWrapper"><img src="img/iconAmenity' + _amenityValues[j] + '.gif" class="amenity' + _amenityValues[j] + '"/>'
                            + '<div class="tooltip amenity' + _amenityValues[j] + '">'
                            + '<div class="tooltipText darkGrey boxShadow">' + amenity + '</div>'
                            + '<div class="tooltipArrow"></div>'
                            + '</div>'
                            + '</span>').appendTo(container);

                        $(container + ' .amenity' + _amenityValues[j]).on('mouseover', function () {
                            $(this).siblings('.tooltip').toggle();
                        }).on('mouseout', function () {
                            $(this).siblings('.tooltip').toggle()
                        });
                    }
                }
            }

            $(container).show();
        }
    }

    // update the comparison panel for amenity list
    function updateComparisonAmenity(selectorBase) {

        // NOTE: the order in the models are not consistent for some reason so using jQuery
        selectorBase = selectorBase || 'div#mycomparison-list-container';
        var propertySelector = selectorBase + ' div.comparison-list > ul > li';

        // check if there is any property with amenity
        var amenitiesDefined = false;
        for (var i = 1; i <= $(propertySelector).length; i++) {
            var amenities = $(propertySelector + ':nth-child(' + i + ') div.comparisonAmenity span.tooltipWrapper');
            if (amenities.length > 0) {
                amenitiesDefined = true;
                break;
            }
        }

        // toggle amenity row
        if (amenitiesDefined) {
            $(selectorBase + ' .comparison-list-lhs div.amenities').show();
            $(selectorBase + ' div.comparisonAmenity').show();
        }
        else {
            $(selectorBase + ' .comparison-list-lhs div.amenities').hide();
            $(selectorBase + ' div.comparisonAmenity').hide();
        }
    }

    // display lease status/new listing text
    function displayLeaseStatus(selector, isLeased, showAsNewUntil) {
        if (isLeased && (isLeased !== "") && (isLeased !== "False"))
            $(selector).html('Leased').show();
        else if (isNewListing(showAsNewUntil))
            $(selector).html('New listing').show();
        else
            $(selector).hide();
    }

    // check if the given date is already past
    // NOTE: the format of date should be either yyyymmdd or d/m/yyyy
    function isNewListing(date) {

        var isNew = false;
        var asNewDate = date;
        if (date) {
            // when the format is yyyymmdd
            if (date.length == 8) {
                asNewDate = date * 1;
            }
            else if (date.length > 5) {

                var dateArray = date.split('/');
                if (dateArray.length == 3) {

                    // get the list date as 8 digit number
                    var day = dateArray[0];
                    var month = dateArray[1];
                    var year = dateArray[2];

                    day = day.length == 1 ? '0' + day : day;
                    month = month.length == 1 ? '0' + month : month;
                    year = year.length == 2 ? '20' + year : year;

                    asNewDate = (year.toString() + month.toString() + day.toString()) * 1;
                }
            }

            if (parseInt(asNewDate) === asNewDate) {
                // get today as 8 digit number
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!
                var yyyy = today.getFullYear();

                dd = dd < 10 ? '0' + dd : dd;
                mm = mm < 10 ? '0' + mm : mm;
                today = (yyyy.toString() + mm.toString() + dd.toString()) * 1;

                logCallee('asNewDate = ' + asNewDate + ', today = ' + today);
                isNew = asNewDate >= today;
            }
        }
        else
            logCallee('no ShowAsNewUntil');

        return isNew;
    }

    function setEvenHeight(items) {
        var _cols = 4;
        var maxHeight;
        var rows = Math.ceil(items.length / _cols);
        for (var i = 0; i < rows; i++) {
            maxHeight = 0;
            for (var j = i * _cols; j < items.length && j < (i + 1) * _cols; j++) {
                var thisHeight = $(items[j]).height();
                if (!maxHeight || (maxHeight < thisHeight))
                    maxHeight = thisHeight;
            }

            for (var j = i * _cols; j < items.length && j < (i + 1) * _cols; j++) {
                items[j].style.height = maxHeight + 'px';
            }
        }
    }
};

$(document).ready(function () {

    GBB.init();

});

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
