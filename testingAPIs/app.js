/* global google */ // to fix Cloud9's error messages that "google is not defined"

var map;
var locations = [{
    title: 'mhs',
    location: {
        lat: 35.747443,
        lng: -83.978086
    }
}, {
    title: 'other place',
    location: {
        lat: 30.747443,
        lng: -83.978086
    }
}, {
    title: '3rd place',
    location: {
        lat: 35.747443,
        lng: -65.978086
    }
}];

var markers = [];
var areas = [];

// nothing is currently being drawn
var polygon = null;


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 35.845626,
            lng: -86.390778
        },
        zoom: 7
    });

    var marker = new google.maps.Marker({
        position: locations[0].locations,
        map: map,
        title: 'MHS'
    });

    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();


    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON // other types are circle, rectangle, line, or just placing markers 
            ]
        }
    });

    for (var i = 0; i < locations.length; i++) {
        //get position from location array
        var position = locations[i].location;
        var title = locations[i].title;

        //create marker per location
        marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        bounds.extend(marker.position);

        marker.addListener('click', function() {
            populateInfoWindow(this, infowindow, bounds);
        });

        document.getElementById("show-listings").addEventListener('click', showListings);
        document.getElementById("hide-listings").addEventListener('click', hideListings);

        document.getElementById("toggle-drawing").addEventListener('click', function() {
            toggleDrawing(drawingManager);
        });
        
        document.getElementById("zoom-to-area").addEventListener("click", function() {
            zoomToArea();
        });

        drawingManager.addListener('overlaycomplete', function(event) {

            drawingManager.setDrawingMode(null);

            polygon = event.overlay;
            polygon.setEditable(true);

            searchWithinPolygon();
            calcArea();

            polygon.getPath().addListener('set_at', searchWithinPolygon);
            polygon.getPath().addListener('insert_at', searchWithinPolygon);
            polygon.getPath().addListener('set_at', calcArea);
            polygon.getPath().addListener('insert_at', calcArea);
            
        });
    }
    var zoomAutoComplete = new google.maps.places.Autocomplete(
        document.getElementById("zoom-to-area-text")
    );
}

function populateInfoWindow(marker, infowindow, bounds) {
    // Check to make sure infowindow is not already opened on this marker
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div><br><iframe width="560" height="315" src="https://www.youtube.com/embed/FLnzmihIg-Q?list=PLgGbWId6zgaXFR4SW_3qJ55cxmEqRNIzx" frameborder="0" allowfullscreen></iframe>');
        infowindow.open(map, marker);
        // ensure marker property is cleared if infowindow is closed
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null; // allows you to close and reopen infowindows more than once
        });
    }

    map.fitBounds(bounds); // fitBounds just zooms to a spot where all markers can be seen
}

function toggleDrawing(drawingManager) {
    if (drawingManager.map) {
        drawingManager.setMap(null);
    }
    else {
        drawingManager.setMap(map);
    }
}

function searchWithinPolygon() {
    for (var i = 0; i < markers.length; i++) {
        if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
            markers[i].setMap(map);
        }
        else {
            markers[i].setMap(null);
        }
    }
}

function showListings() {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function calcArea() {
    var area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    
    areas.push(area);

    // eventListener fires off a ton of times
    // this is supposed to see if the last area is the same as the current one so that the area is only logged once
    if (area != areas[areas.indexOf(area)-1]) { 
        console.log("The area is " + area + " square ft");
    } else {
        areas.splice(areas.indexOf(area), 1);
    }
}

function zoomToArea() {
    var geocoder = new google.maps.Geocoder();
    
    var address = document.getElementById("zoom-to-area-text").value;
    
    if (address == "") {
        window.alert("You must enter an area or address.");
    } else {
        geocoder.geocode(
            {address: address,
            componentRestrictions: {locality: "Tennessee"}
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(20);
                } else {
                    window.alert("We could not find that location - try entering a more specific place.");
                }
            }
        );
    }
}

