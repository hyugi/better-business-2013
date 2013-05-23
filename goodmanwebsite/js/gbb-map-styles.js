// Grey background with blue roads
var blueRoadStyle = [
	{
	featureType: "all",
	stylers: [
	  { saturation: -80 }
	]
	},{
	featureType: "road.arterial",
	elementType: "geometry",
	stylers: [
	  { hue: "#00ffee" },
	  { saturation: 50 }
	]
	},{
	featureType: "poi.business",
	elementType: "labels",
	stylers: [
	  { visibility: "off" }
	]
	}
];

var desaturatedStyle = [
  {
    featureType: "all",
    stylers: [
      { saturation: -80 }
    ]
  }
];

var pinkParkStyle = [
  {
    featureType: "all",
    stylers: [
      { saturation: -80 }
    ]
  },
  {
    featureType: "poi.park",
    stylers: [
      { hue: "#ff0023" },
      { saturation: 40 }
    ]
  }
];

var unclutteredStyle = [
  {
    featureType: "all",
    stylers: [
      { saturation: -80 }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "labels",
    stylers: [
      { visibility: "off" }
    ]
  },
  {
    featureType: "road.local",
    elementType: "labels",
    stylers: [
      { visibility: "off" }
    ]
  },
  {
    featureType: "poi",
    stylers: [
      { visibility: "off" }
    ]
  }
];

var unclutteredStyle2 = [
  {
      featureType: "all",
      stylers: [
      { saturation: -80 }
    ]
  },
  {
      featureType: "road.arterial",
      elementType: "geometry"
  },
  {
      featureType: "road.local",
      elementType: "labels",
      stylers: [
      { visibility: "off" }
      ]
  },
  {
      featureType: "poi",
      stylers: [
      { visibility: "off" }
    ]
  }
];

  var unclutteredStyle3 = [
  {
      featureType: "all",
      stylers: [
      { saturation: -80 }
    ]
  },
  {
      featureType: "road.arterial",
      elementType: "geometry"
  },
  {
      featureType: "road.local",
      elementType: "geometry"
  },
  {
      featureType: "poi",
      stylers: [
      { visibility: "off" }
    ]
  }
];
