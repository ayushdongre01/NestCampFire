// Set the MapTiler API key for authentication
maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',   // HTML container ID where the map will be displayed
    style: maptilersdk.MapStyle.BRIGHT,  // Use the 'BRIGHT' map style
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

// Create a marker at the campground's location
new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates) // Set marker position
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })   // Create a popup with an offset
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>` // Set the popup content with the campground title and location
            )
    )
    .addTo(map)  // Add the marker to the map