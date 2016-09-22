var map;
var locations = [
    {
    title: 'mhs',
    location: {
        lat: 35.747443,
        lng: -83.978086
    }
}, 
{
    title: 'other place',
    location: {
        lat: 30.747443,
        lng: -83.978086
    }
}, 
{
    title: '3rd place',
    location: {
        lat: 35.747443,
        lng: -65.978086
    }
}];

var markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.845626, lng: -86.390778},
        zoom: 7
    });

    var marker = new google.maps.Marker({
        position: locations[0].locations,
        map: map,
        title: 'MHS'
    });
    var infowindow = new google.maps.InfoWindow({
        content: "Maryville High School"
    })

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < locations.length; i++) {
        //get position from location array
        var position = locations[i].location;
        var title = locations[i].title;

        //create marker per location
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        bounds.extend(marker.position);

        marker.addListener('click', function() {
            populateInfoWindow(this, infowindow);
        })

        function populateInfoWindow(marker, infowindow) {
            // Check to make sure infowindow is not already opened on this marker
            if (infowindow.marker != marker) {
                infowindow.marker = marker;
                infowindow.setContent('<div>' + marker.title + '</div><br><div></div>');
                infowindow.open(map, marker);
                // ensure marker property is cleared if infowindow is closed
                infowindow.addListener('closeclick', function() {
                    infowindow.setMarker(null); // What does this do?
                });
            }

            map.fitBounds(bounds); // fitBounds just zooms to a spot where all markers can be seen


        }

        document.getElementById("show-listings").addEventListener('click', showListings);
        document.getElementById("hide-listings").addEventListener('click', hideListings);
    }
}

function showListings() {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position)
    }
    map.fitBounds(bounds);
}

function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}