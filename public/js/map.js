mapboxgl.accessToken = 'pk.eyJ1Ijoic3VjZW5kbyIsImEiOiJja3dvd243c3EwNzFhMm5sY3BycXZocXB6In0.JzhjXlVPZEUl_lr4mBw8zw';
    // These options control the camera position after animation
    const start = {
        center: [-3.6416936879862467, 40.40156369365539],
        zoom: 9,
        pitch: 25,
        bearing: 155
    };
    const end = {
        center: [-3.6886754071479833, 40.38611463758258],
        zoom: 15,
	pitch: 72,
        bearing: 350        
    };

    const map = new mapboxgl.Map({
        container: 'map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/light-v10',
        ...start
    });

    const arena = [-3.686149308117554, 40.37018595052673];
    const arenapopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'La Caja Mágica (Pabellón Indoor Norte) Sede de la competición desde este año 2023.'
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
        'BEGOÑA BULLS | SEDE: Nuestra Señora de Begoña | HISTORIA: Conocidos en los inicios de la liga como los Golden North Warriors, los Begoña Bulls, llevan en la competición desde el año 2015. A pesar de no haber conseguido hasta la fecha ningún título, han dado siempre mucha guerra y buen juego en la pista, convirtiéndose en uno de los rivales más duros durante todas las temporadas. | PALMARÉS: Subcampeón de Liga (2015-2016) / Subcampeón de Copa (2022)'
    );
    // create DOM element for the BEG
    const beg = document.createElement('div');
    beg.id = 'begona';
    // create the BEG
    new mapboxgl.Marker(beg)
        .setLngLat(BEG)
        .setPopup(BEGpopup)
        .addTo(map);

    const endBEG = {
        center: [-3.6878671994080525, 40.48392247600748],
        zoom: 9,
	pitch: 80,
        bearing: 180        
    };

    const SJO = [-3.696719919048703, 40.41907215725797];
    const SJOpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'SAN JOSÉ PROPHETS | SEDE: San José | HISTORIA: Conocidos en los inicios como los Houston Prophets, los San José Prophets, llevan en la liga desde la primera temporada alla en el año 2015. Siempre favoritos para el título, este equipo siempre ha estado en lo más alto, siendo la bestia negra de muchos de sus adversarios. | PALMARÉS: Campeón de La Copa de Cristo Rey (2019) / Campeón de La Copa de Cristo Rey (2023) / Campeón de Liga (2023)'
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
        'LA PALOMA B.C. | SEDE: Virgen de la Paloma y San Pedro el Real | HISTORIA: | PALMARÉS: Campeón de La Copa de Cristo Rey (2018) / Subcampeón de La Copa de Cristo Rey (2023)'
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
        'LABOURE SPINNERS | SEDE: Santa Catalina Labouré | HISTORIA: | PALMARÉS: Subcampeón de Liga (2023)'
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
        'LOS ÁNGELES PRAYERS | SEDE: San Sebastián | HISTORIA: Equipo histórico de la liga, conocido como los Pantoraptors hasta la pasada campaña. Siempre han estado compitiendo por la liga, desde el inicio de la liga en el año 2015. A pesar de no haber conseguido ningún título, son un duro y ágil equipo que siempre da la campanada todas las temporadas. | PALMARÉS: '
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
        'SIENA | SEDE: Santa Catalina de Siena | HISTORIA: | PALMARÉS: Subcampeón de Liga (2017-2018) / Campeón de Liga (2018-2019) / Subcampeón de la Copa de Cristo Rey (2019) / Campeón de La Copa de Cristo Rey (2020) / Campeón de La Copa de Cristo Rey (2022) / Campeón de Liga (2021-2022)'
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
        'SALTERIO LAUDERS | SEDE: San Juan de Mirasierra | HISTORIA: | PALMARÉS: Campeón de Liga (2016-2017) / Campeón de Liga (2017-2018) / Subcampeón de Liga (2018-2019)'
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
        'BETSAIDA BOANERGES | SEDE: Santiago y San Juan Bautista | HISTORIA: Conocidos desde sus inicios como Santiago e los Hijos del Trueno hasta la pasada temporada, llevan en la liga desde el año 2015, y tienen el honor de haberse proclamado como los primeros campeones de la liga por la temporada 2015-2016. Siempre ha sido un equipo muy competitivo, a pesar de haber tenido un par de años flojos respecto a resultados, pero jamás ningún equipo se confía ante estos gigantes de la competición. | PALMARÉS: Campeón de liga (2015-2016) / Subcampeón de liga (2021-2022)'
    );
// create DOM element for the SJO
    const bet = document.createElement('div');
    bet.id = 'betsaidaboanerges';
    // create the SJO
    new mapboxgl.Marker(bet)
        .setLngLat(BET)
        .setPopup(BETpopup)
        .addTo(map);

    const SNW = [-3.7051862247690837, 40.491247893452545];
    const SNWpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'SNOW KNIGTHS | SEDE: Nuestra Señora de las Nieves | HISTORIA: Nueva incorporación en nuestra liga | PALMARÉS: '
    );
// create DOM element for the SNW
    const snw = document.createElement('div');
    snw.id = 'snowknights';
    // create the SNW
    new mapboxgl.Marker(snw)
        .setLngLat(SNW)
        .setPopup(SNWpopup)
        .addTo(map);

    const VAL = [-3.629403937072695, 40.54808706139967];
    const VALpopup = new mapboxgl.Popup({ offset: 25 }).setText(
        'THE VALVA CHERUBS | SEDE: Nuestra Señora de la Valvanera | HISTORIA: Nueva incorporación en nuestra liga | PALMARÉS: '
    );
// create DOM element for the VAL
    const val = document.createElement('div');
    val.id = 'snowknights';
    // create the VAL
    new mapboxgl.Marker(val)
        .setLngLat(VAL)
        .setPopup(VALpopup)
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
                'minzoom': 14,
                'paint': {
                    'fill-extrusion-color': '#aaa',

                    // Use an 'interpolate' expression to
                    // add a smooth transition effect to
                    // the buildings as the user zooms in.
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        14,
                        0,
                        15.05,
                        ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        14,
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
