// let dotenv = require('dotenv');
//
// let app_key = process.env.app_key;

let guhMap;
let infoWindow;
let searchLocation;

function initAutocomplete() {
  guhMap = new google.maps.Map(document.getElementById('map'), {
  center: new google.maps.LatLng(37.0902, -95.7129),
  zoom: 4
  });
  guhMap.addListener("click", function (event) {
      // set the lat and lon of the click coordinates
      let latitude = event.latLng.lat();
      let longitude = event.latLng.lng();
      let pos = {
        lat: latitude,
        lng: longitude,
      };
      searchLocation=latitude+','+longitude;
      createEventMarkers(searchLocation);
      guhMap.setCenter(pos);
      guhMap.setZoom(12);
      console.log(longitude,latitude);
    })
  infoWindow = new google.maps.InfoWindow;
  let input = document.getElementById('pac-input');
  let searchBox = new google.maps.places.SearchBox(input);
  guhMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
  searchBox.addListener('places_changed',
    function() {
      let places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }
      let pos = {
        lat: places[0].geometry.location.lat(),
        lng: places[0].geometry.location.lng(),
      };
      searchLocation=places[0].address_components[0].long_name+','+places[0].address_components[2].long_name;
      createEventMarkers(searchLocation);
      guhMap.setCenter(pos);
      guhMap.setZoom(12);
    });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      convertGeoCords(pos);
      guhMap.setCenter(pos);
      guhMap.setZoom(12);

    }, function() {
      handleLocationError(true, infoWindow, guhMap.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, guhMap.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  // infoWindow.open(map);

}

function convertGeoCords(cordObj) {
  let $xhr = $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng='+cordObj.lat+','+cordObj.lng+'&key=XXXXX');
  $xhr.done(function(data) {
    if ($xhr.status !== 200) {
      return;
    }
    searchLocation = data.results[0].address_components[3].long_name + ',' + data.results[0].address_components[5].long_name
    createEventMarkers(searchLocation)
  })
  $xhr.fail(function(err) {
    console.log(err);
  });
}


function createEventMarkers(searchLocation){
  let callBegin = Date.now();
  let $hr = $.getJSON('https://g-eventful.herokuapp.com/json/events/search?app_key=XXXXX&location=' + searchLocation + '&page_size=25');
  $hr.done(function(data) {
    if ($hr.status !== 200) {
      return;
    }
    console.log((Date.now() - callBegin) / 1000);

    let $jqxhr = $.post( "http://nps.kanelabs.com", {"type":"Trailhead"})
    .done(function( data ) {
    console.log( "Data Loaded: " + data );
    if (data.err){
      console.log(data.err)
    }else {

      console.log(data.success)
    }
  })
  // console.log(data.events.event.length);
  infowindow = new google.maps.InfoWindow
    // / Loop through the data and place a marker for each
    // set of coordinates.
    for (let i = 0; i < data.events.event.length; i++) {
      // console.log(data.events.event[i])
      let latLng = new google.maps.LatLng(data.events.event[i].latitude, data.events.event[i].longitude);
      marker = new google.maps.Marker({
        position: latLng,
        map: guhMap,
        title: 'Click for event info'
      });
      // marker.addListener('click', function() {
      //     map.setZoom(14);
      //     // console.log(marker)
      //     // map.setCenter(marker.getPosition());
      //   })

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        infowindow.close()
        return function() {
          markerMouseover=true;
          let month = ['Jan','Feb','March','April','June','July','Aug','Sept','Oct','Nov','Dec'];
          let startTimeArr = []
          let startDate = []
          let endTimeArr = []
          let endDate = []
          let when = ''
          let startTimeStr=data.events.event[i].start_time
          let startMonthInt = 0
          let endMonthInt = 0
          startTimeArr=data.events.event[i].start_time.split(' ')
          startDate = startTimeArr[0].split('-')
          console.log(startTimeArr)
          if (startTimeStr!=="00:00:00"){
            let startTimeArrSplit=[]
            startTimeArrSplit=startTimeArr[1].split(':')
            if(startTimeArrSplit[0]>12){
              startTimeStr=(startTimeArrSplit[0]-12)+':'+startTimeArrSplit[1]+'pm'
            }else{
              startTimeStr=startTimeArrSplit[0]+':'+startTimeArrSplit[1]+'am'
            }
            // console.log(startTimeArrSplit)
          }else{
            startTimeStr='Click link for more information.'
          }
          if (data.events.event[i].stop_time!==null){
            endTimeArr=data.events.event[i].stop_time.split(' ')
            endDate = endTimeArr[0].split('-')
            startMonthInt = parseInt(startDate[1],10)
            endMonthInt = parseInt(endDate[1],10)
            when = month[startMonthInt]+' '+startDate[2] + ' - ' + month[endMonthInt]+' '+endDate[2]
            // console.log(startDate[1])
            // console.log(parseInt(endDate[1],10))
            // console.log(endDate)
          }else{
            when = 'Today'
            // console.log(startDate)
          }
          let description = data.events.event[i].description
          if (description===null){
            description='Click link for more information'
          }else{
            description=data.events.event[i].description
          }
          let streetName = data.events.event[i].venue_address
          if(streetName===null||streetName===','){
            streetName=''
          }else{
            streetName = data.events.event[i].venue_address
          }
          let zipcode = data.events.event[i].postal_code
          if(zipcode===null){
            zipcode=''
          }else{
            zipcode = ', '+data.events.event[i].postal_code
          }

          infowindow.setContent('<div id="content">'+
                      '<div id="siteNotice">'+
                      '</div>'+
                      '<h1 id="firstHeading" class="firstHeading">'+data.events.event[i].title+'</h1>'+'<h3>'+data.events.event[i].venue_name+'</h3>'+
                      '<h3><b>'+streetName+'<br>'+data.events.event[i].city_name+', '+data.events.event[i].region_name+zipcode+'</b></h3>'+
                      '<div id="bodyContent">'+description+'</p>'
                      +'<p><b>When: '+when
                      // +startTimeStr
                      +'</b></p>'+
                      '<p>Special Thanks: <a href='+data.events.event[i].url+'>Eventful & '+data.events.event[i].venue_name+
                      '</a></p>'+
                      '</div>'+
                      '</div>');
          infowindow.open(guhMap, marker);
        }
      })(marker, i))

      google.maps.event.addListener(marker, 'mouseout', function(marker) {
        window.setTimeout(function() {
      infowindow.close();
    }, 2000);
      });

    }

    let clear = document.getElementById('pac-input').value = '';
  });
  $hr.fail(function(err) {
    console.log(err);
  });

}
