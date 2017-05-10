let guhMap;
let infoWindow;
let searchLocation;
let searchType = 'All'
var markers = []

function initAutocomplete() {
  guhMap = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(37.0902, -95.7129),
    zoom: 4
  });
  infoWindow = new google.maps.InfoWindow;
  searchBar()
  createFilterControlBox()
  // searchByClick()
  reverseNav()
}

function reverseNav(){
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
  let $xhr = $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + cordObj.lat + ',' + cordObj.lng + '&key=AIzaSyA-c7nBnaF1rAjzLZxQoSN4wWfgiFyTeFs');
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

function createEventMarkers() {
  if (searchType==='All'){
    callAPI(searchLocation,searchType)
    // kaneLabs()
  }else if(searchType==='Indoor'){
    callAPI(searchLocation,searchType)
  }else if(searchType==='Outdoor'){
    callAPI(searchLocation,searchType)
  }else if(searchType==='Trails'){
    kaneLabs()
  }else if (searchType==='Music'){
    callAPI(searchLocation,searchType)
  }
}
var resultBoxes = document.getElementsByClassName('resultBoxes')

function callAPI(searchLocation,searchType){
  // let callBegin = Date.now();
  let $hr = $.getJSON('https://g-eventful.herokuapp.com/json/events/search?location=' + searchLocation + '&keywords='+searchType+'&page_size=55');
  $hr.done(function(data) {
    if ($hr.status !== 200) {
      return;
    }
    $(resultBoxes).remove()
    createMarkerAndInfo(data)
    let clear = document.getElementById('pac-input').value = '';
  });
  $hr.fail(function(err) {
    console.log(err);
  });
}

function createMarkerAndInfo(data){
  infowindow = new google.maps.InfoWindow
  infowindow2 = new google.maps.InfoWindow
  infowindow3 = new google.maps.InfoWindow
  infowindow4 = new google.maps.InfoWindow


  // / Loop through the data and place a marker for each
  // set of coordinates.
  for (let i = 0; i < data.events.event.length; i++) {
    // console.log(data)
    let pos = {
      lat: data.events.event[i].latitude,
      lng: data.events.event[i].longitude,
    };
    let latLng = new google.maps.LatLng(data.events.event[i].latitude, data.events.event[i].longitude);
    marker = new google.maps.Marker({
      position: latLng,
      map: guhMap,
      title: 'Click for event info'
    });

    markers.push(marker)
    createResultsBox(data,marker,i)
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        closeInfoWindows()
        markerMouseover = true;
        let month = ['Jan', 'Feb', 'March', 'April', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let startTimeArr = []
        let startDate = []
        let endTimeArr = []
        let endDate = []
        let when = ''
        let startTimeStr = data.events.event[i].start_time
        let startMonthInt = 0
        let endMonthInt = 0
        startTimeArr = data.events.event[i].start_time.split(' ')
        startDate = startTimeArr[0].split('-')
        console.log(startTimeArr)
        if (startTimeStr !== "00:00:00") {
          let startTimeArrSplit = []
          startTimeArrSplit = startTimeArr[1].split(':')
          if (startTimeArrSplit[0] > 12) {
            startTimeStr = (startTimeArrSplit[0] - 12) + ':' + startTimeArrSplit[1] + 'pm'
          } else {
            startTimeStr = startTimeArrSplit[0] + ':' + startTimeArrSplit[1] + 'am'
          }
          // console.log(startTimeArrSplit)
        } else {
          startTimeStr = 'Click link for more information.'
        }
        if (data.events.event[i].stop_time !== null) {
          endTimeArr = data.events.event[i].stop_time.split(' ')
          endDate = endTimeArr[0].split('-')
          startMonthInt = parseInt(startDate[1], 10)
          endMonthInt = parseInt(endDate[1], 10)
          when = month[startMonthInt] + ' ' + startDate[2] + ' - ' + month[endMonthInt] + ' ' + endDate[2]
          // console.log(startDate[1])
          // console.log(parseInt(endDate[1],10))
          // console.log(endDate)
        } else {
          when = 'Today'
          // console.log(startDate)
        }
        let description = data.events.event[i].description
        if (description === null) {
          description = 'Click link for more information'
        } else {
          description = data.events.event[i].description
        }
        let streetName = data.events.event[i].venue_address
        if (streetName === null || streetName === ',') {
          streetName = ''
        } else {
          streetName = data.events.event[i].venue_address
        }
        let zipcode = data.events.event[i].postal_code
        if (zipcode === null) {
          zipcode = ''
        } else {
          zipcode = ', ' + data.events.event[i].postal_code
        }

        infowindow.setContent('<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          '<h1 id="firstHeading" class="firstHeading">' + data.events.event[i].title + '</h1>' + '<h3>' + data.events.event[i].venue_name + '</h3>' +
          '<h3><b>' + streetName + '<br>' + data.events.event[i].city_name + ', ' + data.events.event[i].region_name + zipcode + '</b></h3>' +
          '<div id="bodyContent">' + description + '</p>' +
          '<p><b>When: ' + when
          // +startTimeStr
          +
          '</b></p>' +
          '<p>Special Thanks: <a href=' + data.events.event[i].url + '>Eventful & ' + data.events.event[i].venue_name +
          '</a></p>' +
          '</div>' +
          '</div>');
        infowindow.open(guhMap, marker);
      }
    })(marker, i))


    google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {

      return function() {
        closeInfoWindows()
        markerMouseover = true;
        let month = ['Jan', 'Feb', 'March', 'April', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let startTimeArr = []
        let startDate = []
        let endTimeArr = []
        let endDate = []
        let when = ''
        let startTimeStr = data.events.event[i].start_time
        let startMonthInt = 0
        let endMonthInt = 0
        startTimeArr = data.events.event[i].start_time.split(' ')
        startDate = startTimeArr[0].split('-')
        if (startTimeStr !== "00:00:00") {
          let startTimeArrSplit = []
          startTimeArrSplit = startTimeArr[1].split(':')
          if (startTimeArrSplit[0] > 12) {
            startTimeStr = (startTimeArrSplit[0] - 12) + ':' + startTimeArrSplit[1] + 'pm'
          } else {
            startTimeStr = startTimeArrSplit[0] + ':' + startTimeArrSplit[1] + 'am'
          }
          // console.log(startTimeArrSplit)
        } else {
          startTimeStr = 'Click link for more information.'
        }
        if (data.events.event[i].stop_time !== null&&data.events.event[i].stop_time!==data.events.event[i].start_time) {
          endTimeArr = data.events.event[i].stop_time.split(' ')
          endDate = endTimeArr[0].split('-')
          startMonthInt = parseInt(startDate[1], 10)
          endMonthInt = parseInt(endDate[1], 10)
          when = month[startMonthInt] + ' ' + startDate[2] + ' - ' + month[endMonthInt] + ' ' + endDate[2]
          // console.log(startDate[1])
          // console.log(parseInt(endDate[1],10))
          // console.log(endDate)
        } else {
          when = 'Today'
          // console.log(startDate)
        }
        let description = data.events.event[i].description
        if (description === null) {
          description = 'Click link for more information'
        } else {
          description = data.events.event[i].description
        }
        let streetName = data.events.event[i].venue_address
        if (streetName === null || streetName === ',') {
          streetName = ''
        } else {
          streetName = data.events.event[i].venue_address
        }


        infowindow2.setContent('<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          '<p id="hoverInfo" class="firstHeading">'+ '<b>' + data.events.event[i].title + '</b>'+'<br>'
          + data.events.event[i].venue_name + '<br>'
          + streetName + '<br>'
          +when+' <br>Click for more info. </p>' +
          '</div>' +
          '</div>');
        infowindow2.open(guhMap, marker);
        // console.log('hello')
      }
    })(marker, i))

    google.maps.event.addListener(marker, 'mouseout', function(marker) {
      window.setTimeout(function() {
        infowindow.close();
        infowindow2.close();
        infowindow3.close()
        infowindow4.close()
      }, 2000);
    });


  }
}
var testData;
function kaneLabs(){
  let $jqxhr = $.post("https://g-kanelabs.herokuapp.com/", {
      "type": "Trailhead"
    })
    .done(function(data) {
      console.log("Data Loaded: " + data);
      if (data.err) {
        console.log(data.err)
      } else {
        // console.log(data.success[0])
        let pos = {
          lat: 40.3428,
          lng: -105.6836,
        };
        infowindow = new google.maps.InfoWindow
        // / Loop through the data and place a marker for each
        // set of coordinates.
        for (let i = 0; i < data.success.length; i++) {
          // console.log(data)
          let latLng = new google.maps.LatLng(data.success[i].lat.N, data.success[i].lng.N);
          marker = new google.maps.Marker({
            position: latLng,
            map: guhMap,
            title: 'Click for trail info'
          });
          markers.push(marker)
        }


        guhMap.setCenter(pos)
        guhMap.setZoom(10)
      }
    })
}

function createFilterControlBox(){
  // Create the DIV to hold the control and call the filterControlBox()
  // constructor passing in this DIV.
  var centerControlDiv = document.createElement('div');
  var centerControl = new filterControlBox(centerControlDiv, map);
  centerControlDiv.index = 1;
  guhMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
}
var currentResult = 0
var currentMore = 8
function createResultsBox(data,marker,i){
  if (i<currentResult+9){
  var resultsControlDiv = document.createElement('div');
  var resultsControl = new resultsControlBox(resultsControlDiv, map,data,marker,i);
  resultsControlDiv.index = 1;
  guhMap.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(resultsControlDiv);

}

}
function resultsControlBox(controlDiv, guhMap,data,marker,i){
  var resultsUI = document.createElement('div')
  resultsUI.style.backgroundColor = '#fff';
  resultsUI.style.border = '2px solid #fff';
  resultsUI.style.height = '20vh'
  resultsUI.style.width = '100px'
  resultsUI.setAttribute('class','resultBoxes')
  resultsUI.style.borderRadius = '3px';
  resultsUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  resultsUI.style.cursor = 'pointer';
  // resultsUI.style.marginBottom = '22px';
  resultsUI.style.textAlign = 'center';
  resultsUI.style.innerHTML='Hello'
  resultsUI.title = 'Click to change filter';
  controlDiv.appendChild(resultsUI);

  var resultsDiv = document.createElement('div')
  resultsDiv.style.color = 'rgb(25,25,25)';
  resultsDiv.style.fontFamily = 'Roboto,Arial,sans-serif';
  resultsDiv.style.fontSize = '16px';
  resultsDiv.style.lineHeight = '38px';
  resultsDiv.style.paddingLeft = '5px';
  resultsDiv.style.paddingRight = '5px';
  if (i===currentMore){
  resultsDiv.innerHTML = 'more...';
  resultsUI.addEventListener('click',function(marker,i){
    currentResult+=8
    currentMore+= 8
    $(resultBoxes).remove()
    for (i=currentResult;i<currentResult+9;i++){
      // console.log(data)
      createResultsBox(data,markers[i],i)
    }
    // console.log(data,marker,i)
    // createResultsBox(data,marker,i)
  })

}else{
  resultsDiv.innerHTML = data.events.event[currentResult + i].title;

}
  resultsUI.appendChild(resultsDiv);
  // console.log(data,marker,i)

if(i<currentResult+8){
  resultsUI.addEventListener('click', (function(marker, i) {
  return function() {
    closeInfoWindows()
    let month = ['Jan', 'Feb', 'March', 'April', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    let startTimeArr = []
    let startDate = []
    let endTimeArr = []
    let endDate = []
    let when = ''
    let startTimeStr = data.events.event[i+currentResult].start_time
    let startMonthInt = 0
    let endMonthInt = 0
    startTimeArr = data.events.event[i+currentResult].start_time.split(' ')
    startDate = startTimeArr[0].split('-')
    console.log(startTimeArr)
    if (startTimeStr !== "00:00:00") {
      let startTimeArrSplit = []
      startTimeArrSplit = startTimeArr[1].split(':')
      if (startTimeArrSplit[0] > 12) {
        startTimeStr = (startTimeArrSplit[0] - 12) + ':' + startTimeArrSplit[1] + 'pm'
      } else {
        startTimeStr = startTimeArrSplit[0] + ':' + startTimeArrSplit[1] + 'am'
      }
      // console.log(startTimeArrSplit)
    } else {
      startTimeStr = 'Click link for more information.'
    }
    if (data.events.event[i+currentResult].stop_time !== null) {
      endTimeArr = data.events.event[i+currentResult].stop_time.split(' ')
      endDate = endTimeArr[0].split('-')
      startMonthInt = parseInt(startDate[1], 10)
      endMonthInt = parseInt(endDate[1], 10)
      when = month[startMonthInt] + ' ' + startDate[2] + ' - ' + month[endMonthInt] + ' ' + endDate[2]
      // console.log(startDate[1])
      // console.log(parseInt(endDate[1],10))
      // console.log(endDate)
    } else {
      when = 'Today'
      // console.log(startDate)
    }
    let description = data.events.event[i+currentResult].description
    if (description === null) {
      description = 'Click link for more information'
    } else {
      description = data.events.event[i+currentResult].description
    }
    let streetName = data.events.event[i+currentResult].venue_address
    if (streetName === null || streetName === ',') {
      streetName = ''
    } else {
      streetName = data.events.event[i+currentResult].venue_address
    }
    let zipcode = data.events.event[i+currentResult].postal_code
    if (zipcode === null) {
      zipcode = ''
    } else {
      zipcode = ', ' + data.events.event[i+currentResult].postal_code
    }

    infowindow3.setContent('<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<h1 id="firstHeading" class="firstHeading">' + data.events.event[i+currentResult].title + '</h1>' + '<h3>' + data.events.event[i+currentResult].venue_name + '</h3>' +
      '<h3><b>' + streetName + '<br>' + data.events.event[i+currentResult].city_name + ', ' + data.events.event[i+currentResult].region_name + zipcode + '</b></h3>' +
      '<div id="bodyContent">' + description + '</p>' +
      '<p><b>When: ' + when
      // +startTimeStr
      +
      '</b></p>' +
      '<p>Special Thanks: <a href=' + data.events.event[i+currentResult].url + '>Eventful & ' + data.events.event[i+currentResult].venue_name +
      '</a></p>' +
      '</div>' +
      '</div>');
    infowindow3.open(guhMap, marker);
  }
})(marker, i))


resultsUI.addEventListener('mouseover', (function(marker, i) {
    return function() {
      closeInfoWindows()
      markerMouseover = true;
      let month = ['Jan', 'Feb', 'March', 'April', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      let startTimeArr = []
      let startDate = []
      let endTimeArr = []
      let endDate = []
      let when = ''
      let startTimeStr = data.events.event[i+currentResult].start_time
      let startMonthInt = 0
      let endMonthInt = 0
      startTimeArr = data.events.event[i+currentResult].start_time.split(' ')
      startDate = startTimeArr[0].split('-')
      if (startTimeStr !== "00:00:00") {
        let startTimeArrSplit = []
        startTimeArrSplit = startTimeArr[1].split(':')
        if (startTimeArrSplit[0] > 12) {
          startTimeStr = (startTimeArrSplit[0] - 12) + ':' + startTimeArrSplit[1] + 'pm'
        } else {
          startTimeStr = startTimeArrSplit[0] + ':' + startTimeArrSplit[1] + 'am'
        }
        // console.log(startTimeArrSplit)
      } else {
        startTimeStr = 'Click link for more information.'
      }
      if (data.events.event[i+currentResult].stop_time !== null&&data.events.event[i+currentResult].stop_time!==data.events.event[i+currentResult].start_time) {
        endTimeArr = data.events.event[i+currentResult].stop_time.split(' ')
        endDate = endTimeArr[0].split('-')
        startMonthInt = parseInt(startDate[1], 10)
        endMonthInt = parseInt(endDate[1], 10)
        when = month[startMonthInt] + ' ' + startDate[2] + ' - ' + month[endMonthInt] + ' ' + endDate[2]
        // console.log(startDate[1])
        // console.log(parseInt(endDate[1],10))
        // console.log(endDate)
      } else {
        when = 'Today'
        // console.log(startDate)
      }
      let description = data.events.event[i+currentResult].description
      if (description === null) {
        description = 'Click link for more information'
      } else {
        description = data.events.event[i+currentResult].description
      }
      let streetName = data.events.event[i+currentResult].venue_address
      if (streetName === null || streetName === ',') {
        streetName = ''
      } else {
        streetName = data.events.event[i+currentResult].venue_address
      }


      infowindow4.setContent('<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<p id="hoverInfo" class="firstHeading">'+ '<b>' + data.events.event[i+currentResult].title + '</b>'+'<br>'
        + data.events.event[i+currentResult].venue_name + '<br>'
        + streetName + '<br>'
        +when+' <br>Click for more info. </p>' +
        '</div>' +
        '</div>');
      infowindow4.open(guhMap, marker);
    }
  })(marker, i))
}

}


function filterControlBox(controlDiv, guhMap) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  // controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to change filter';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Filter: ' + searchType;
  controlUI.appendChild(controlText);

  var filterOptions = document.createElement('div');
  filterOptions.style.display = 'none';
  filterOptions.style.backgroundColor = '#fff';
  filterOptions.style.border = '2px solid #fff';
  filterOptions.style.borderRadius = '3px';
  filterOptions.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  filterOptions.style.cursor = 'pointer';
  filterOptions.style.marginBottom = '22px';
  filterOptions.style.textAlign = 'center';
  filterOptions.title = 'Click to change filter';
  controlDiv.appendChild(filterOptions);
  var filterList = document.createElement('div');
  filterList.style.color = 'rgb(25,25,25)';
  filterList.style.lineHeight = '38px';
  filterList.style.paddingLeft = '5px';
  filterList.style.paddingRight = '5px';
  filterOptions.appendChild(filterList);
  var filterTypes=['All','Music','Indoor','Outdoor','Trails']

for (i=0;i<filterTypes.length;i++){
  var filterItems = document.createElement('div')
  filterItems.style.fontFamily = 'Roboto,Arial,sans-serif';
  filterItems.style.fontSize = '16px';
  filterItems.setAttribute('id',[i])
  filterItems.innerHTML = filterTypes[i];
  filterList.appendChild(filterItems)
  filterItems.addEventListener('click',function(){
    deleteMarkers()
    searchType=this.innerHTML;
    filterOptions.style.display = 'none'
    createEventMarkers(searchLocation)
    controlText.innerHTML = 'Filter: ' + searchType;

  })
}
  // guhMap.addEventListener('click', function() {
  //   if(filterOptions.style.display === 'block'){
  //     filterOptions.style.display = 'none'
  //     console.log('helo')
  //   }
  // })

  controlUI.addEventListener('click', function() {
    if (filterOptions.style.display === 'none'){
      filterOptions.style.display = 'block'
    }else{
      filterOptions.style.display = 'none'
    }
  });

}

function searchBar(){
  let input = document.getElementById('pac-input');
  let searchBox = new google.maps.places.SearchBox(input);
  guhMap.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
  // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
  searchBox.addListener('places_changed',
    function() {
      // deleteMarkers()
      let places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }
      let pos = {
        lat: places[0].geometry.location.lat(),
        lng: places[0].geometry.location.lng(),
      };
      searchLocation = places[0].address_components[0].long_name + ',' + places[0].address_components[2].long_name;
      createEventMarkers(searchLocation);
      guhMap.setCenter(pos);
      guhMap.setZoom(12);
    });
}

function searchByClick(){
  //  Click feature that gives cords of clicked location
  guhMap.addListener("click", function(event) {
    deleteMarkers()
    // set the lat and lon of the click coordinates
    let latitude = event.latLng.lat();
    let longitude = event.latLng.lng();
    let pos = {
      lat: latitude,
      lng: longitude,
    };
    searchLocation = latitude + ',' + longitude;
    createEventMarkers(searchLocation);
    guhMap.setCenter(pos);
    guhMap.setZoom(12);
    console.log(longitude, latitude);
  })
}

// Sets the map on all markers in the array.
      function setMapOnAll(guhMap) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(guhMap);
        }
      }

      // Removes the markers from the guhMap, but keeps them in the array.
      function clearMarkers() {
        setMapOnAll(null);
      }

      // Shows any markers currently in the array.
      function showMarkers() {
        setMapOnAll(guhMap);
      }

      // Deletes all markers in the array by removing references to them.
      function deleteMarkers() {
        clearMarkers();
        markers.length=0;
      }

      function closeInfoWindows(){
        infowindow.close()
        infowindow2.close()
        infowindow3.close()
        infowindow4.close()
      }
