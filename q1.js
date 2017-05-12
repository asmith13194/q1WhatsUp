let guhMap;
let infoWindow;
let searchLocation;
let searchType = 'All';
let markers = [];
let resultBoxes = document.getElementsByClassName('resultBoxes')
let filterBoxes = document.getElementsByClassName('filterBoxes')
let currentResult = 0
let currentMore = 6
let currentBack = 0
let currentSubtract = 1

function initAutocomplete() {
  guhMap = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(37.0902, -95.7129),
    zoom: 4,
    mapTypeId:"satellite"
  });
  infoWindow = new google.maps.InfoWindow;
  searchBar()
  createFilterControlBox()
  // searchByClick()
  reverseNav()
}

function reverseNav() {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      guhMap.setCenter(pos);
      guhMap.setZoom(12);
      convertGeoCords(pos);

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


function searchBar() {
  let input = document.getElementById('pac-input');
  let searchBox = new google.maps.places.SearchBox(input);
  // input.style.width = '160px'
  input.style.marginTop = '10px'
  guhMap.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
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
      searchLocation = places[0].address_components[0].long_name + ',' + places[0].address_components[2].long_name;
      everyDangTime(pos,12,searchLocation)
    });
}



function searchByClick() {
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
    guhMap.setCenter(pos);
    guhMap.setZoom(12);
    createEventMarkers(searchLocation);
    // console.log(longitude, latitude);
  })
}

function createEventMarkers() {
  if (searchType === 'All') {
    callAPI(searchLocation, searchType)
    // kaneLabs()
  } else if (searchType === 'Indoor') {
    callAPI(searchLocation, searchType)
  } else if (searchType === 'Outdoor') {
    callAPI(searchLocation, searchType)
  } else if (searchType === 'Trails') {
    kaneLabs(searchType)
  } else if (searchType === 'Music') {
    callAPI(searchLocation, searchType)
  }
}

function callAPI(searchLocation, searchType) {
  // let callBegin = Date.now();
  let $hr = $.getJSON('https://g-eventful.herokuapp.com/json/events/search?location=' + searchLocation + '&keywords=' + searchType + '&page_size=20&sort_order=date');
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

function kaneLabs(searchType) {
  // console.log(guhMap)
  // console.log(guhMap.getBounds())
  let woo = guhMap.getBounds()
  const coords = {
    "northEast":{
      lat:woo.f.b,
      lng:woo.b.f
    },
    "southWest":{
      lat:woo.f.f,
      lng:woo.b.b
    },
  };
  // console.log(coords.northEast);
  // console.log(woo.b.b,woo.b.f)
  // console.log(woo.f.f,woo.f.b);
  let $jqxhr = $.post("https://g-kanelabs.herokuapp.com/", {
      "northEastLat": coords.northEast.lat,
      "northEastLng": coords.northEast.lng,
      "southWestLat": coords.southWest.lat,
      "southWestLng": coords.southWest.lng,
      "type": "Trailhead"
    })
    .done(function(data) {
      // console.log("Data Loaded: " + data);
      if (data.err) {
        console.log(data.err)
      } else {
        // console.log(data.success)
        let pos = {
          lat: 40.285128,
          lng: -105.688179,
        };
        guhMap.setCenter(pos)
        guhMap.setZoom(12)
        // infowindow = new google.maps.InfoWindow
        // / Loop through the data and place a marker for each
        // set of coordinates.
        for (let i = 0; i < data.success.length; i++) {
          let latLng = new google.maps.LatLng(data.success[i].lat.N, data.success[i].lng.N);
          marker = new google.maps.Marker({
            position: latLng,
            map: guhMap,
            title: 'Click for trail info'
          });
          markers.push(marker)
          // console.log(markers);
        }
        $(resultBoxes).remove()
        // createMarkerAndInfo(data)

      }
    })
}

function createMarkerAndInfo(data) {
  infowindow1 = new google.maps.InfoWindow
  infowindow2 = new google.maps.InfoWindow
  // / Loop through the data and place a marker for each
  // set of coordinates.
  for (let i = 0; i < data.events.event.length; i++) {
    let latLng = new google.maps.LatLng(data.events.event[i].latitude, data.events.event[i].longitude);
    marker = new google.maps.Marker({
      position: latLng,
      map: guhMap,
      title: 'Click for event info'
    });
    markers.push(marker)
    createResultsBox(data, marker, i)
    addMarkerClick(data, marker, i)
    addMarkerMouseover(data, marker, i)
    addMarkerMouseout(data, marker, i)
  }
}

function createResultsBox(data, marker, i) {
  if (i < currentResult + 7) {
    // var abc = document.getElementsByClassName('gmnoscreen')
    // abc.style.display = 'none'
    let resultsControlDiv = document.createElement('div');
    let resultsControl = new resultsControlBox(resultsControlDiv, map, data, marker, i);
    resultsControlDiv.index = 1;
        guhMap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(resultsControlDiv);
  }
}

function resultsControlBox(controlDiv, guhMap, data, marker, i) {
  let resultsUI = document.createElement('div')
  resultsUI.style.backgroundColor = '#fff';
  resultsUI.style.border = '2px solid #fff';
  resultsUI.style.width = '70px'
  resultsUI.setAttribute('class', 'resultBoxes')
  resultsUI.style.borderRadius = '3px';
  resultsUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  resultsUI.style.cursor = 'pointer';
  resultsUI.style.textAlign = 'center';
  resultsUI.title = 'Click to change filter';
  resultsUI.style.color = 'rgb(25,25,25)';
  resultsUI.style.fontFamily = 'Roboto,Arial,sans-serif';
  resultsUI.style.fontSize = '12px';
  resultsUI.style.lineHeight = '38px';
  resultsUI.style.paddingLeft = '5px';
  resultsUI.style.paddingRight = '5px';
  resultsUI.style.zIndex = '1'
  controlDiv.appendChild(resultsUI);

    if (i === currentBack){
      if (i===0){
        resultsUI.style.display='none'
      }
      resultsUI.innerHTML = 'Prev';
      resultsUI.style.fontWeight = 'bold'
      resultsUI.style.fontSize = '2em'
      resultsUI.style.marginRight = '10px'
      resultsUI.style.marginBottom = '10px'

      // filterUI.style.border = '2px solid orange';

      resultsUI.addEventListener('click', function(marker, i) {
        currentResult -= 7
        currentMore -= 7
        currentBack -= 7
        currentSubtract -= 2
        $(resultBoxes).remove()
        // console.log(data.events.event.length);
        for (i = currentResult; i < currentResult + 7 && i < data.events.event.length; i++) {
          closeInfoWindows()
          createResultsBox(data, markers[i], i)
    }
  })
}
    else if (i === currentMore) {
    resultsUI.innerHTML = 'Next';
    resultsUI.style.fontWeight = 'bold'
    resultsUI.style.fontSize = '2em'
    resultsUI.style.marginLeft = '10px'
    resultsUI.style.marginBottom = '10px'
    resultsUI.addEventListener('click', function(marker, i) {
      currentResult += 7
      currentMore += 7
      currentBack += 7
      currentSubtract+=2
      $(resultBoxes).remove()
      // console.log(data.events.event.length);
      for (i = currentResult; i < currentResult + 7; i++) {
        console.log(data.events.event.length)
        if(i===data.events.event.length-1){
          return
        }else{
          closeInfoWindows()
          createResultsBox(data, markers[i], i)
        }
      }
    })
  } else {
    if(searchType==='All'){
      resultsUI.style.border = '2px solid teal';
    }else if(searchType==='Music'){
      resultsUI.style.border = '2px solid gold';
    }else if(searchType==='Indoor'){
      resultsUI.style.border = '2px solid blue';
    }else if(searchType==='Outdoor'){
      resultsUI.style.border = '2px solid red';
    }else if(searchType==='Trails'){
      resultsUI.style.border = '2px solid purple';
    }
    resultsUI.innerHTML = data.events.event[i].title.substring(0,8)
    // resultsUI.innerHTML = data.events.event[i]
    resultsUI.style.width = '50px'
    resultsUI.style.marginBottom = '12px';
    resultsUI.style.height = '5vh'
    resultsUI.style.fontWeight = 'bold'
    resultsClick(data, marker, i, resultsUI)
    resultsMouseover(data, marker, i, resultsUI)
    resultsMouseout(data, marker, i, resultsUI)
  }
  // resultsUI.appendChild(resultsDiv);
}

function createFilterControlBox() {
  // Create the DIV to hold the control and call the filterControlBox()
  // constructor passing in this DIV.
  let filterControlDiv = document.createElement('div');
  let centerControl = new filterControlBox(filterControlDiv, map);
  filterControlDiv.setAttribute('id','CDC')
  filterControlDiv.index = 1;
  guhMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(filterControlDiv);
}

function filterControlBox(controlDiv, guhMap) {
  // Set CSS for the control border.
  let filterUI = document.createElement('div');
  filterUI.style.backgroundColor = '#fff';
  filterUI.style.border = '2px solid teal';
  filterUI.style.borderRadius = '5px';
  filterUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  filterUI.style.cursor = 'pointer';
  filterUI.style.marginTop = '10px';
  filterUI.style.marginRight = '10px';
  filterUI.style.textAlign = 'center';
  filterUI.title = 'Click for more info';
  filterUI.style.color = 'rgb(25,25,25)';
  filterUI.style.fontFamily = 'Roboto,Arial,sans-serif';
  filterUI.style.fontSize = '16px';
  filterUI.style.lineHeight = '38px';
  filterUI.style.paddingLeft = '5px';
  filterUI.style.paddingRight = '5px';
  filterUI.innerHTML = 'Filters';
  filterUI.setAttribute('class', 'filterBoxes pulse')
  controlDiv.appendChild(filterUI);

  let theMasterDiv = document.createElement('div')
  theMasterDiv.setAttribute('id','master')
  theMasterDiv.style.display='none'
  controlDiv.appendChild(theMasterDiv);
  let filterTypes = ['Music', 'Indoor', 'Outdoor', 'Trails','All']
  let filterColors = ['gold','blue','red','purple','teal']

  for (i = 0; i < filterTypes.length; i++) {
    let filterOptions = document.createElement('div');
    filterOptions.style.display = 'block';
    filterOptions.style.backgroundColor = '#fff';
    filterOptions.style.border = '2px solid '+filterColors[i];
    filterOptions.style.borderRadius = '5px';
    filterOptions.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    filterOptions.style.cursor = 'pointer';
    filterOptions.style.marginRight = '10px';
    filterOptions.style.textAlign = 'center';
    filterOptions.title = 'Click to change filter';
    filterOptions.style.color = 'rgb(25,25,25)';
    filterOptions.style.lineHeight = '38px';
    filterOptions.style.paddingLeft = '5px';
    filterOptions.style.paddingRight = '5px';
    filterOptions.style.fontFamily = 'Roboto,Arial,sans-serif';
    filterOptions.style.fontSize = '16px';
    filterOptions.setAttribute('class', 'filterOptions')
    filterOptions.innerHTML = filterTypes[i];
    theMasterDiv.appendChild(filterOptions);

    filterOptions.addEventListener('click', function() {
      deleteMarkers()
      searchType = this.innerHTML;
      filterUI.style.border = filterOptions.style.border
      // resultsUI.style.border = filterOptions.stylee.border
      theMasterDiv.style.display = 'none'
      filterUI.innerHTML = searchType;
      currentMore = 6
      currentBack = 0
      currentResult = 0
      createEventMarkers(searchLocation)
    })

    filterUI.addEventListener('click', function() {
      filterUI.setAttribute('class', 'filterBoxes')
      if (theMasterDiv.style.display === 'none') {
        theMasterDiv.style.display = 'block'
      } else {
        theMasterDiv.style.display = 'none'
      }
    });
  }


}

function everyDangTime(x,y,z){
  guhMap.setCenter(x);
  guhMap.setZoom(y);
  createEventMarkers(z);
}

// Sets the map on all markers in the array.
function setMapOnAll(guhMap) {
  for (let i = 0; i < markers.length; i++) {
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
  markers.length = 0;
}

function closeInfoWindows() {
  infowindow1.close()
  infowindow2.close()
}

function starty(data, i) {
  let startDateObj = new Date(data.events.event[i].start_time)
  let stopDateObj = new Date(data.events.event[i].stop_time)
  // if (stopDateObj!=='Wed Dec 31 1969 17:00:00 GMT-0700'){
  //   if(startDateObj.getHours()!==00&&stopDateObj.getHours()!==00){
  //     if(stopDateObj.getHours()<12){
  //       return ' @ '+ startDateObj.getHours() + ':00 - '+stopDateObj.getHours() + ':00 am'
  //     }
  //     else if (startDateObj>12&&stopDateObj.getHours()>12){
  //       return ' @ '+ (startDateObj.getHours()-12) + ':00 '+(stopDateObj.getHours()-12) + ':00 pm'
  //     }else {
  //       return ' @ '+ (startDateObj.getHours()) + ':00 '+(stopDateObj.getHours()-12) + ':00 pm'
  //     }
  //   }else if(startDateObj.getHours()!==00){
  //     if(startDateObj.getHours()<12){
  //       return ' @ '+ startDateObj.getHours() + ':00 am'
  //     }
  //     else {
  //       return ' @ '+ (startDateObj.getHours()-12) + ':00 pm'
  //     }
  //   }else{
  //     return ' Click link for time info'
  //   }
  // }else{
  if (startDateObj.getHours() !== 00) {
    if (startDateObj.getHours() < 12) {
      return ' @ ' + startDateObj.getHours() + ':00 am'
    } else {
      return ' @ ' + (startDateObj.getHours() - 12) + ':00 pm'
    }
  } else {
    return ' Click link for time info'
  }
}
// }

function datey(data, i) {
  // console.log(data.events.event[i])
  let month = ['Jan', 'Feb', 'March', 'April','May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  let startDateObj = new Date(data.events.event[i].start_time)
  let stopDateObj = new Date(data.events.event[i].stop_time)
  if (data.events.event[i].stop_time !== null) {
    if (startDateObj.getMonth() === stopDateObj.getMonth() && startDateObj.getDate() === stopDateObj.getDate()) {
      return 'Today'
    } else {
      return month[startDateObj.getMonth()] + ' ' + startDateObj.getDate() + ' - ' + month[stopDateObj.getMonth()] + ' ' + stopDateObj.getDate()
    }
  } else {
    if (startDateObj.getDate()===12){
      return 'Today'
    }else{
      return month[startDateObj.getMonth()] + ' ' + startDateObj.getDate()
    }
  }
}

function description(data, i) {
  if (data.events.event[i].description === null) {
    return 'Click link for more information'
  } else {
    return data.events.event[i].description
  }
}

function zipcode(data, i) {
  if (data.events.event[i].postal_code === null) {
    return ''
  } else {
    return ', ' + data.events.event[i].postal_code
  }
}
function performers(data,i){
  if (data.events.event[i].performers!==null){
    return (data.events.event[i].performers)
  }else{
    return
  }
}
function eventImage(data,i){
  if (data.events.event[i].image!==null){
    return ('<img class="bigShow'+[i]+'" src="'+data.events.event[i].image.medium.url+'"alt=FUN>');
    // return (data.events.event[i].image.medium.url)
  }else{
    return
  }
}
function infowindowBiggie(data, i) {
  // eventImage(data,i)

  return infowindow1.setContent('<div id="content">' +
    '<div id="siteNotice">' +
    '</div>' +
    '<h2 id="firstHeading" class="firstHeading">' + data.events.event[i].title + '</h2>' + '<h3>' + data.events.event[i].venue_name + '</h3>' +
    '<h3><b>' + streetName(data, i) + '<br>' + data.events.event[i].city_name + ', ' + data.events.event[i].region_name + zipcode(data, i) + '</b></h3>' +
    '<div id="bodyContent">' + description(data, i) + '</p>' +
    '<p><b>When: ' + datey(data, i) + starty(data, i)
    // +startTimeStr
    +
    '</b></p>' +
    '<p>More Information @ <a href=' + data.events.event[i].url + '>' + data.events.event[i].venue_name +
    '</a></p>' +
    '</div>' +
    '</div>');
}

function infowindowLittle(data, i) {
  performers(data,i)
  eventImage(data,i)

  infowindow2.setContent('<div id="content">' +
    '<div id="siteNotice">' +
    '</div>' +
    '<p id="hoverInfo" class="firstHeading">' + '<b>' + data.events.event[i].title + '</b>' + '<br>' +
    data.events.event[i].venue_name + '<br>' +
    streetName(data, i) + '<br>' + datey(data, i) + starty(data, i) +
    ' <br>Click for more info. </p>' +
    '</div>' +
    '</div>');
}

function streetName(data, i) {
  if (data.events.event[i].venue_address === null || data.events.event[i].venue_address === ',') {
    return ''
  } else {
    return data.events.event[i].venue_address
  }
}

function addMarkerClick(data, marker, i) {
  google.maps.event.addListener(marker, 'click', (function(marker, i) {
    return function() {
      closeInfoWindows()
      markerMouseover = true;
      infowindowBiggie(data, i)
      infowindow1.open(guhMap, marker);
    }
  })(marker, i))
}

function addMarkerMouseover(data, marker, i) {
  google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
    return function() {
      closeInfoWindows()
      markerMouseover = true;
      infowindowLittle(data, i)
      infowindow2.open(guhMap, marker);
      // console.log('hello')
    }
  })(marker, i))
}

function addMarkerMouseout(data, marker, i) {
  google.maps.event.addListener(marker, 'mouseout', function(marker) {
    window.setTimeout(function() {
      // closeInfoWindows()
      infowindow2.close()
    }, 1500);
  });
}

function resultsMouseout(data, marker, i, resultsUI) {
  resultsUI.addEventListener('mouseout', (function(marker, i) {
    // closeInfoWindows()
    infowindow2.close()
  }))
}

function resultsMouseover(data, marker, i, resultsUI) {
  resultsUI.addEventListener('mouseover', (function(marker, i) {
    return function() {
      closeInfoWindows()
      markerMouseover = true;
      infowindowLittle(data, i)
      infowindow2.open(guhMap, marker);
    }
  })(marker, i))
}

function resultsClick(data, marker, i, resultsUI) {
  resultsUI.addEventListener('click', (function(marker, i) {
    return function() {
      closeInfoWindows()
      infowindowBiggie(data, i)
      infowindow1.open(guhMap, marker);
    }
  })(marker, i))
}
