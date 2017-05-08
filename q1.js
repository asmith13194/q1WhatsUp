// var dotenv = require('dotenv');
//
// var app_key = process.env.app_key;

var map, infoWindow, searchLocation;

function initAutocomplete() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(37.0902, -95.7129),
    zoom: 4
  });
  infoWindow = new google.maps.InfoWindow;
  var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();
          console.log(places)
          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];
          var pos = {
            lat: places[0].geometry.viewport.f.f,
            lng: places[0].geometry.viewport.b.b
          };

          searchLocation=places[0].address_components[0].long_name+','+places[0].address_components[2].long_name
          createInfoWindows(searchLocation)
          map.setCenter(pos);
          map.setZoom(12)
          // // For each place, get the icon, name and location.
          // var bounds = new google.maps.LatLngBounds();
          // places.forEach(function(place) {
          //   if (!place.geometry) {
          //     console.log("Returned place contains no geometry");
          //     return;
          //   }
          //   var icon = {
          //     url: place.icon,
          //     size: new google.maps.Size(71, 71),
          //     origin: new google.maps.Point(0, 0),
          //     anchor: new google.maps.Point(17, 34),
          //     scaledSize: new google.maps.Size(25, 25)
          //   };
          //
          //   // Create a marker for each place.
          //   markers.push(new google.maps.Marker({
          //     map: map,
          //     icon: icon,
          //     title: place.name,
          //     position: place.geometry.location
          //   }));
          //
          //   if (place.geometry.viewport) {
          //     // Only geocodes have viewport.
          //     bounds.union(place.geometry.viewport);
          //   } else {
          //     bounds.extend(place.geometry.location);
          //   }
          // });
          // map.fitBounds(bounds);
        });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      getMarkers()
      map.setCenter(pos);
      map.setZoom(12)
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());

  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  // infoWindow.open(map);

}

function getMarkers() {
  var $xhr = $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=40.0150,-105.2705&key=XXXXXXXX');
  $xhr.done(function(data) {
    if ($xhr.status !== 200) {
      return;
    }
    searchLocation = data.results[0].address_components[3].long_name + ',' + data.results[0].address_components[5].long_name

    createInfoWindows(searchLocation)
  })
  $xhr.fail(function(err) {
    console.log(err);
  });
}



function createInfoWindows(searchLocation){
  var $hr = $.getJSON('https://g-eventful.herokuapp.com/json/events/search?app_key=XXXXXX&location=' + searchLocation);
  $hr.done(function(data) {
    if ($hr.status !== 200) {
      return;
    }
    // console.log(data);
    var infowindow = new google.maps.InfoWindow({ });
    // / Loop through the data and place a marker for each
    // set of coordinates.
    for (var i = 0; i < data.events.event.length; i++) {
      // console.log(data.events.event[i]['venue_name'])
      // console.log(data.events.event[i])

      var latLng = new google.maps.LatLng(data.events.event[i].latitude, data.events.event[i].longitude);
      var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: 'Hover for Event Info'
      });
      // marker.addListener('click', function() {
      //     map.setZoom(14);
      //     // console.log(marker)
      //     // map.setCenter(marker.getPosition());
      //   })
      google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
        return function() {
          infowindow.setContent('<div id="content">'+
                      '<div id="siteNotice">'+
                      '</div>'+
                      '<h1 id="firstHeading" class="firstHeading">'+data.events.event[i].title+'</h1>'+'<h2>'+data.events.event[i].venue_name+'</h2>'+
                      '<header><b>'+data.events.event[i].venue_address+', '+data.events.event[i].city_name+', '+data.events.event[i].region_name+'</b></header>'
                      +
                      '<div id="bodyContent">'
                      +data.events.event[i].description+'</p>'+
                      '<p>Attribution: Eventful, <a href='+data.events.event[i].url+'>'+
                      'eventfulapi.com</a></p>'+
                      '</div>'+
                      '</div>');
          infowindow.open(map, marker);
        }
      })(marker, i))

    }

    // var clear = document.getElementById('search').value = '';
  });
  $hr.fail(function(err) {
    console.log(err);
  });

}
