// Set the MapTiler API key for authentication
maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'cluster-map',   // HTML container ID
    style:  "streets-v2",   // Map style
    //center: [-103.59179687498357, 40.66995747013945],    // Initial map center coordinates of usa
    center: [78.9629, 20.5937], // Center of India (approximate)
    //zoom: 3    // Initial zoom level for usa map
    zoom:4   //Initial zoom level for india map
});

map.on('load', function () {
    // Add a GeoJSON source containing campgrounds data with clustering enabled
    map.addSource('campgrounds', {
        type: 'geojson',
        data: campgrounds,
        cluster: true,  //Enable clustering
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    // Add a layer to represent clusters with different colors and sizes based on the number of points
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.maptiler.com/gl-style-specification/expressions/#step)
            // with three steps to implement three types of circles:
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#00BCD4',  //color for small clusters
                10,
                '#2196F3', //color for medium clusters
                30, 
                '#3F51B5' //color for large clusters
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15, //small cluster radius
                10,
                20, //medium cluster radius
                30,
                25  //large cluster radius
            ]
        }
    });

    // Add a layer to display cluster count labels
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',   // Display cluster count
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12  // Text size
        }
    });

    // Add a layer to show individual (unclustered) points
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',  //point color
            'circle-radius': 4, //point size
            'circle-stroke-width': 1,   //border width
            'circle-stroke-color': '#fff' //border color
        }
    });

    // inspect a cluster on click
    // Expand a cluster on click
    map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);

         // Zoom into the clicked cluster
        map.easeTo({
            center: features[0].geometry.coordinates,
            zoom
        });
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.

    // Show a popup when an individual point is clicked
    map.on('click', 'unclustered-point', function (e) {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.

        // Adjust coordinates if necessary to ensure the popup appears at the correct position
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Create and display a popup with campground details
        new maptilersdk.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)
            .addTo(map);
    });

    // Change cursor to pointer when hovering over clusters
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Reset cursor when leaving clusters
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});