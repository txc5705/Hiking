var mapsKey = "AIzaSyACbKEUZuNonyU2Xs1izhSGzPa46FRjBvI";
let waterMap = "https://edu-esriroedu.opendata.arcgis.com/datasets/0baca6c9ffd6499fb8e5fad50174c4e0_0.geojson";
// Geocoding https://developers.google.com/maps/documentation/javascript/geocoding

// Add map
var mymap = L.map('leafletMap').setView([43.1566,-77.6088], 13);

// Initialize google map
var map, infoWindow;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.15397, lng: -70.6088}, // Rochester, NY
        zoom: 12
    });
}

// Style map
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoidHhjNTcwNSIsImEiOiJjam9mdjBzNGUwOGd0M3hwMzZwMmx0ZHJxIn0.jeYJmb-vkVURVndNkTPxRQ'
}).addTo(mymap);



// Define variables
var nodes = [];
var markers = [];
var pickups = [];
// create a red polyline from an array of LatLng points
var polyline = L.polyline(nodes, {color: 'red'}).addTo(mymap);

// Pickup and droppff are first and last node, or null if it doesn't apply
function dropoff(){return nodes.length >= 1 ? markers[0] : null;}
function pickup(){return nodes.length >= 2 ? markers[nodes.length-1] : null;}

// Map click function
mymap.on({click: mapClick});



// Add marker
var addMarker = function(LatLng){
    var marker = L.marker(LatLng);
    marker.addTo(mymap);
    nodes.push(LatLng);
    polyline.setLatLngs(nodes);
    markers.push(marker);
//    console.log(request("GET", url).responseText);
    return marker;
};

// Update marker and line
var updateMarker = function(e,i){
    nodes = nodes.slice(0,i).concat([e.latlng].concat(nodes.slice((i+1))));
    polyline.setLatLngs(nodes)
};

// Updates various aspects of the map after changes
function finishMap(){
    // Dropoff popup
    if(dropoff()!=null)
        dropoff().bindPopup("<b>Dropoff point</b>", {
            autoClose: false,
            closeOnClick: false,
            closeOnEscapeKey: false,
            closeButton: false
        }).openPopup();

    // Pickup popup
    if(pickup() != null)
        pickup().bindPopup("<b>Pickup point</b>", {
            autoClose: false,
            closeOnClick: false,
            closeOnEscapeKey: false,
            closeButton: false
        }).openPopup();
}

// Handle map clicks
function mapClick(e){

    // Add a marker
    var marker = addMarker(e.latlng);

    // Marker events
    marker.on(
        // Remove on click, or change to a pickup point on shift click
        {click: function(e){
                if(e.originalEvent.shiftKey) {
                    // Check if already a marker
                    var closing = false;
                    for (var i = 0; i < pickups.length; i++)
                        if (pickups[i] === marker) {
                            console.log("Closing popup");
                            pickups[i].closePopup();
                            pickups.splice(i, 1);
                            closing = true;
                            break
                        }

                    // Add a popup stating it's a pickup point
                    if (!closing) {
                        var popup = marker.bindPopup("<b>Resupply Point</b>", {
                            autoClose: false,
                            closeOnClick: false,
                            closeOnEscapeKey: false,
                            closeButton: false
                        });
                        popup.openPopup();
                        LatLng = marker.getLatLng();

                        console.log("Adding marker to "+(LatLng.lat).toString()+","+LatLng.lng.toString());
                        var resp = getPlaces("restaurant",LatLng);
                        console.log(resp);

                        pickups.push(marker)
                    }



                } else { // Remove marker if regular click
                    mymap.removeLayer(marker);
                    var index = nodes.indexOf(marker._latlng);
                    nodes.splice(index, 1);
                    polyline.setLatLngs(nodes); // Update line
                    markers.splice(index, 1);
                    for(var i = 0; i < markers.length; i++)
                        if(pickups[i] === marker)
                            pickups.splice(i,1)
                }
            },
            // Move event
            move: function(e){
                var index = nodes.indexOf(e.oldLatLng);
                updateMarker(e,index);
            }});
}

// Gets a list of places at a location
// Skeleton code for this function taken from google's documentation
function getPlaces(query,LatLng){
    var result;
    //(LatLng.lat).toString()+","+LatLng.lng.toString()
    var request = {
        type: query,
        fields: ['name','geometry'],
        location: LatLng,
        radius: 1000
    };

    var service = new google.maps.places.PlacesService(map);
    return service.nearbySearch(request, function(results, status){
        result = results;
        setTimeout(function(){
            //do what you need here
        }, 2000);
        for(var i = 0; i < results.length; i++){
            place = results[i]
            var circle = L.circle([ place.geometry.location.lat(),place.geometry.location.lng()], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 50
            }).addTo(mymap);

            circle.bindPopup(place.name, {
                autoClose: false,
                closeOnClick: false,
                closeOnEscapeKey: false,}).openPopup();
        }
    });
    return result
}

/*
// Add circle
var circle = L.circle([43.1566,-77.6088], {
	color: 'red',
	fillColor: '#f03',
	fillOpacity: 0.5,
	radius: 500
}).addTo(mymap);

// Add polygon
var polygon = L.polygon([
[43.1564,-77.6088],
[43.1452,-77.6072],
[43.1566,-77.6180]
]).addTo(mymap);

// Add popups
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// Add standalone popup
var popup = L.popup()
.setLatLng([43.1566,-77.6088])
.setContent("I am a standalone popup.")
.openOn(mymap);*/