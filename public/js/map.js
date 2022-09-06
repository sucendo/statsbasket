mapboxgl.accessToken = 'pk.eyJ1Ijoic3VjZW5kbyIsImEiOiJja3dvd243c3EwNzFhMm5sY3BycXZocXB6In0.JzhjXlVPZEUl_lr4mBw8zw';
    // These options control the camera position after animation
    const start = {
        center: [-3.6416936879862467, 40.40156369365539],
        zoom: 9,
        pitch: 20,
        bearing: 180
    };
    const end = {
        center: [-3.6416936879862467, 40.40156369365539],
        zoom: 12.5,
	pitch: 45,
        bearing: 340        
    };

    const map = new mapboxgl.Map({
        container: 'map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/light-v10',
        ...start
    });

    const arena = [-3.6056449561266817, 40.3727423212556];
    const arenapopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'Construction on the Washington Monument began in 1848.'
    );
    // create DOM element for the arena
    const el = document.createElement('div');
    el.id = 'arena';
    // create the arena
    new mapboxgl.Marker(el)
        .setLngLat(arena)
        .setPopup(arenapopup) // sets a popup on this marker
        .addTo(map);

    const BEG = [-3.6878671994080525, 40.48392247600748];
    const BEGpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
    // create DOM element for the BEG
    const beg = document.createElement('div');
    beg.id = 'begona';
    // create the BEG
    new mapboxgl.Marker(beg)
        .setLngLat(BEG)
        .setPopup(BEGpopup)
        .addTo(map);

    const SJO = [-3.696719919048703, 40.41907215725797];
    const SJOpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
    // create DOM element for the SJO
    const sjo = document.createElement('div');
    sjo.id = 'sanjoseprophets';
    // create the SJO
    new mapboxgl.Marker(sjo)
        .setLngLat(SJO)
        .setPopup(SJOpopup)
        .addTo(map);

    const PAL = [-3.7116031177447435, 40.40833748931871];
    const PALpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
    // create DOM element for the SJO
    const pal = document.createElement('div');
    pal.id = 'lapalomabc';
    // create the SJO
    new mapboxgl.Marker(pal)
        .setLngLat(PAL)
        .setPopup(PALpopup)
        .addTo(map);

    const LAB = [-3.72027007288721, 40.38738497066643];
    const LABpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
    // create DOM element for the SJO
    const lab = document.createElement('div');
    lab.id = 'labourespinners';
    // create the SJO
    new mapboxgl.Marker(lab)
        .setLngLat(LAB)
        .setPopup(LABpopup)
        .addTo(map);

    const PRA = [-3.701425083479676, 40.41361989817525];
    const PRApopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
// create DOM element for the SJO
    const pra = document.createElement('div');
    pra.id = 'losangelesprayers';
    // create the SJO
    new mapboxgl.Marker(pra)
        .setLngLat(PRA)
        .setPopup(PRApopup)
        .addTo(map);

    const SIE = [-3.674067169605036, 40.40883706852372];
    const SIEpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
// create DOM element for the SJO
    const sie = document.createElement('div');
    sie.id = 'siena';
    // create the SJO
    new mapboxgl.Marker(sie)
        .setLngLat(SIE)
        .setPopup(SIEpopup)
        .addTo(map);

    const SAL = [-3.715716020861352, 40.49572256328227];
    const SALpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
// create DOM element for the SJO
    const sal = document.createElement('div');
    sal.id = 'salteriolauders';
    // create the SJO
    new mapboxgl.Marker(sal)
        .setLngLat(SAL)
        .setPopup(SALpopup)
        .addTo(map);

    const BET = [-3.7109634569705556, 40.41675819217442];
    const BETpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
// create DOM element for the SJO
    const bet = document.createElement('div');
    bet.id = 'betsaidaboanegers';
    // create the SJO
    new mapboxgl.Marker(bet)
        .setLngLat(BET)
        .setPopup(BETpopup)
        .addTo(map);

    const SPK = [-3.711012586202528, 40.408184990320734];
    const SPKpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'El mejor equipo de la historia.'
    );
// create DOM element for the SJO
    const spk = document.createElement('div');
    spk.id = 'sanpedrokings';
    // create the SJO
    new mapboxgl.Marker(spk)
        .setLngLat(SPK)
        .setPopup(SPKpopup)
        .addTo(map);

    map.on('load', () => {	    
        // Insert the layer beneath any symbol layer.
        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
        ).id;

        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
        // from OpenStreetMap.
        map.addLayer(
            {
                'id': 'add-3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',

                    // Use an 'interpolate' expression to
                    // add a smooth transition effect to
                    // the buildings as the user zooms in.
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            },
            labelLayerId
        );
	
	let isAtStart = true;    
	const target = isAtStart ? end : start;
        isAtStart = !isAtStart;

        map.flyTo({
            ...target, // Fly to the selected target
            duration: 12000, // Animate over 12 seconds
            essential: true // This animation is considered essential with
            //respect to prefers-reduced-motion
        });
	    
    });
