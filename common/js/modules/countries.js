let currentCountry = null;
let currentCountryCode = null;
let hoveredCountryId = null;
let timeMachineMap = null;
let countryLayersActive = true;

// Zoom threshold - interactions disabled below this zoom level
const ZOOM_THRESHOLD = 3.5;

// ── Small countries (module scope) ──
const SMALL_COUNTRIES = {
  MDV: { name: 'Maldives',          coords: [73.5, 3.2] },
  SMR: { name: 'San Marino',        coords: [12.45, 43.93] },
  SGP: { name: 'Singapore',         coords: [103.8, 1.35] },
  BRB: { name: 'Barbados',          coords: [-59.55, 13.17] },
  MLT: { name: 'Malta',             coords: [14.5, 35.9] },
  LIE: { name: 'Liechtenstein',     coords: [9.55, 47.15] },
  MCO: { name: 'Monaco',            coords: [7.42, 43.73] },
  AND: { name: 'Andorra',           coords: [1.52, 42.5] },
  VAT: { name: 'Vatican City',      coords: [12.45, 41.90] },
  NRU: { name: 'Nauru',             coords: [166.93, -0.52] },
  TUV: { name: 'Tuvalu',            coords: [179.2, -8.5] },
  PLW: { name: 'Palau',             coords: [134.5, 7.5] },
  KIR: { name: 'Kiribati',          coords: [173.0, 1.4] },
  WSM: { name: 'Samoa',             coords: [-172.1, -13.8] },
  GRD: { name: 'Grenada',           coords: [-61.7, 12.1] },
  LCA: { name: 'Saint Lucia',       coords: [-60.98, 13.9] },
  VCT: { name: 'St Vincent & Gren.',coords: [-61.2, 13.25] },
  DMA: { name: 'Dominica',          coords: [-61.35, 15.4] },
  ATG: { name: 'Antigua & Barbuda', coords: [-61.8, 17.05] },
  KNA: { name: 'St Kitts & Nevis',  coords: [-62.75, 17.35] },
  SYC: { name: 'Seychelles',        coords: [55.45, -4.65] },
  COM: { name: 'Comoros',           coords: [43.3, -11.7] },
  STP: { name: 'São Tomé & Príncipe', coords: [6.7, 0.3] },
  CPV: { name: 'Cabo Verde',        coords: [-23.6, 16.0] },
  BHS: { name: 'Bahamas',           coords: [-76.0, 24.5] },
  BHR: { name: 'Bahrain',           coords: [50.55, 26.0] },
  QAT: { name: 'Qatar',             coords: [51.2, 25.3] },
  MUS: { name: 'Mauritius',         coords: [57.5, -20.3] },
};

// ── Territory → sovereign (module scope) ──
const TERRITORY_SOVEREIGN = {
  FRO: { code: 'DNK', name: 'Denmark' },
  GRL: { code: 'DNK', name: 'Denmark' },
  PRI: { code: 'USA', name: 'United States' },
  GUM: { code: 'USA', name: 'United States' },
  VIR: { code: 'USA', name: 'United States' },
  ASM: { code: 'USA', name: 'United States' },
  MNP: { code: 'USA', name: 'United States' },
  HKG: { code: 'CHN', name: 'China' },
  MAC: { code: 'CHN', name: 'China' },
  ABW: { code: 'NLD', name: 'Netherlands' },
  CUW: { code: 'NLD', name: 'Netherlands' },
  SXM: { code: 'NLD', name: 'Netherlands' },
  NCL: { code: 'FRA', name: 'France' },
  PYF: { code: 'FRA', name: 'France' },
  GUF: { code: 'FRA', name: 'France' },
  MTQ: { code: 'FRA', name: 'France' },
  GLP: { code: 'FRA', name: 'France' },
  REU: { code: 'FRA', name: 'France' },
  MYT: { code: 'FRA', name: 'France' },
  SPM: { code: 'FRA', name: 'France' },
  BLM: { code: 'FRA', name: 'France' },
  MAF: { code: 'FRA', name: 'France' },
  GIB: { code: 'GBR', name: 'United Kingdom' },
  BMU: { code: 'GBR', name: 'United Kingdom' },
  CYM: { code: 'GBR', name: 'United Kingdom' },
  TCA: { code: 'GBR', name: 'United Kingdom' },
  VGB: { code: 'GBR', name: 'United Kingdom' },
  AIA: { code: 'GBR', name: 'United Kingdom' },
  MSR: { code: 'GBR', name: 'United Kingdom' },
  SHN: { code: 'GBR', name: 'United Kingdom' },
  FLK: { code: 'GBR', name: 'United Kingdom' },
  SGS: { code: 'GBR', name: 'United Kingdom' },
  PCN: { code: 'GBR', name: 'United Kingdom' },
  IOT: { code: 'GBR', name: 'United Kingdom' },
  CXR: { code: 'AUS', name: 'Australia' },
  CCK: { code: 'AUS', name: 'Australia' },
  NFK: { code: 'AUS', name: 'Australia' },
  COK: { code: 'NZL', name: 'New Zealand' },
  NIU: { code: 'NZL', name: 'New Zealand' },
  TKL: { code: 'NZL', name: 'New Zealand' },
  ESH: { code: 'MAR', name: 'Morocco' },
  PSE: { code: null,  name: null },
};

// Function to add country layers to the map
function addCountryLayers(map) {
  // Check if source already exists, if so remove it
  if (map.getSource('countries')) {
    if (map.getLayer('country-fills')) map.removeLayer('country-fills');
    if (map.getLayer('country-borders')) map.removeLayer('country-borders');
    map.removeSource('countries');
  }

  // Add country boundaries source
  map.addSource('countries', {
    type: 'vector',
    url: 'https://demotiles.maplibre.org/tiles/tiles.json'
  });

  // Add fill layer for countries with hover effect
  map.addLayer({
    id: 'country-fills',
    type: 'fill',
    source: 'countries',
    'source-layer': 'countries',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#6b7280',
        'transparent'
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.3,
        0
      ]
    }
  });

  // Add borders for better visibility
  map.addLayer({
    id: 'country-borders',
    type: 'line',
    source: 'countries',
    'source-layer': 'countries',
    paint: {
      'line-color': '#9ca3af',
      'line-width': 1,
      'line-opacity': 0.5
    }
  });

  console.log('✓ Country layers added');
}

// Toggle country layer visibility based on zoom
function toggleCountryLayers(map, visible) {
  if (!map) return;
  
  const fillLayer = map.getLayer('country-fills');
  const borderLayer = map.getLayer('country-borders');

  if (fillLayer) {
    map.setLayoutProperty('country-fills', 'visibility', visible ? 'visible' : 'none');
  }
  if (borderLayer) {
    map.setLayoutProperty('country-borders', 'visibility', visible ? 'visible' : 'none');
  }
  
  countryLayersActive = visible;
  console.log(`Country interactions ${visible ? 'enabled' : 'disabled'} (zoom threshold)`);
}

function addSmallCountryMarkers(map) {
  if (map.getSource('small-countries')) return;

  const features = Object.entries(SMALL_COUNTRIES).map(([code, info]) => ({
    type: 'Feature',
    properties: {
      NAME: info.name,
      ADM0_A3: code,
      iso_a3: code,
      is_small: true
    },
    geometry: {
      type: 'Point',
      coordinates: info.coords
    }
  }));

  map.addSource('small-countries', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features }
  });

  // Visible dot
  map.addLayer({
    id: 'small-country-dots',
    type: 'circle',
    source: 'small-countries',
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['zoom'],
        2, 3.5,
        5, 5,
        8, 7
      ],
      'circle-color': '#c76f4a',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
      'circle-opacity': 0.9
    }
  });

  // Larger invisible hit area for easier clicking
  map.addLayer({
    id: 'small-country-hit',
    type: 'circle',
    source: 'small-countries',
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['zoom'],
        2, 14,
        5, 18,
        8, 22
      ],
      'circle-opacity': 0
    }
  });

  map.on('mouseenter', 'small-country-hit', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'small-country-hit', () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('click', 'small-country-hit', (e) => {
    if (!e.features.length) return;
    showCountrySidebar(e.features[0].properties);
  });
}

export function setupCountryInteractions(map) {
  console.log("=== Setting up country interactions ===");
  
  // Store map reference for TimeMachine
  timeMachineMap = map;
  
  // Initialize TimeMachine
  import('./timemachine.js').then(mod => {
    mod.setupTimeMachine(map);
    console.log('✓ TimeMachine ready');
  }).catch(err => {
    console.error('TimeMachine module not found:', err);
    console.log('TimeMachine features will be disabled');
  });

  // Function to setup event handlers
  const setupEventHandlers = () => {
    // Mouse move for hover effect
    map.on('mousemove', 'country-fills', (e) => {
      if (e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';

        if (hoveredCountryId !== null) {
          map.setFeatureState(
            { source: 'countries', sourceLayer: 'countries', id: hoveredCountryId },
            { hover: false }
          );
        }

        hoveredCountryId = e.features[0].id;
        map.setFeatureState(
          { source: 'countries', sourceLayer: 'countries', id: hoveredCountryId },
          { hover: true }
        );
      }
    });

    // Mouse leave
    map.on('mouseleave', 'country-fills', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredCountryId !== null) {
        map.setFeatureState(
          { source: 'countries', sourceLayer: 'countries', id: hoveredCountryId },
          { hover: false }
        );
      }
      hoveredCountryId = null;
    });

    // Click to show sidebar
    map.on('click', 'country-fills', (e) => {
      if (e.features.length > 0) {
        const country = e.features[0];
        console.log('Country clicked:', country.properties.NAME);
        showCountrySidebar(country.properties);
      }
    });

    console.log('✓ Event handlers attached');
  };
  
  // Setup zoom-based toggling
  const setupZoomToggle = () => {
    // Check initial zoom level
    const currentZoom = map.getZoom();
    if (currentZoom < ZOOM_THRESHOLD) {
      toggleCountryLayers(map, false);
    }
    
    // Listen for zoom changes
    map.on('zoom', () => {
      const zoom = map.getZoom();
      
      if (zoom < ZOOM_THRESHOLD && countryLayersActive) {
        // Zoomed out too far - disable interactions
        toggleCountryLayers(map, false);
      } else if (zoom >= ZOOM_THRESHOLD && !countryLayersActive) {
        // Zoomed back in - enable interactions
        toggleCountryLayers(map, true);
      }
    });
    
    console.log(`✓ Zoom toggle enabled (threshold: ${ZOOM_THRESHOLD})`);
  };

  // If map is already loaded, add layers immediately
  if (map.isStyleLoaded()) {
    addCountryLayers(map);
    addSmallCountryMarkers(map);
    setupEventHandlers();
    setupZoomToggle();
  } else {
    map.once('load', () => {
      addCountryLayers(map);
      addSmallCountryMarkers(map);
      setupEventHandlers();
      setupZoomToggle();
    });
  }
}

async function showCountrySidebar(properties) {
  const sidebar = document.getElementById('countrySidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (!sidebar || !overlay) {
    console.error('Sidebar elements not found');
    return;
  }

  // 1. Get fallback values from vector tile
  const fallbackName = properties.NAME || properties.name || 'Unknown';
  const code3 = properties.ADM0_A3 || properties.iso_a3 || '';
  const sovereign = TERRITORY_SOVEREIGN[code3];
  const sovereignHtml = sovereign && sovereign.name
    ? `<div class="info-row">
        <span class="info-label">Sovereign state</span>
        <span class="info-value">${sovereign.name}</span>
      </div>`
    : '';
  const rawPop = properties.POP_EST || properties.pop_est || null;

  // DOM Elements
  const nameElement = document.getElementById('countryName');
  const officialNameEl = document.getElementById('countryOfficialName');
  const nativeNameEl = document.getElementById('countryNativeName');
  const flagElement = document.getElementById('countryFlag');
  const subtitleBlock = document.getElementById('countrySubtitleBlock');
  const regionEl = document.getElementById('countryRegion');
  const infoContainer = document.getElementById('countryInfo');

  // Set default loading UI state
  if (nameElement) nameElement.textContent = fallbackName;
  if (officialNameEl) officialNameEl.textContent = '';
  if (nativeNameEl) nativeNameEl.textContent = '';
  if (subtitleBlock) subtitleBlock.style.display = 'none';

  if (infoContainer) {
    infoContainer.innerHTML = `
      <div class="info-row">
        <span class="info-label">Population:</span>
        <span class="info-value">${formatPopulation(rawPop)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">ISO Code:</span>
        <span class="info-value">${code3}</span>
      </div>
    `;
  }

  sidebar.classList.add('active');
  overlay.classList.add('active');

  currentCountry = fallbackName;
  currentCountryCode = code3;

  updateTimeMachineButton(code3, fallbackName);

  // 2. Fetch authenticated data from restcountries v5
  if (code3) {
    const apiKey = 'rc_live_4de1754bd78942d3bb35081f7d4e25ba';
    
    try {
      const url = `https://api.restcountries.com/countries/v5/codes.alpha_3/${code3}?api-key=${apiKey}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (response.ok) {
        const raw = await response.json();
        const data = raw?.data?.objects?.[0];

        if (!data) {
          console.warn('No country object in response', raw);
          return;
        }

        // Names
        if (nameElement) nameElement.textContent = data.names?.common || fallbackName;
        if (officialNameEl) officialNameEl.textContent = data.names?.official || '';

        // Flag
        if (flagElement) {
          const flagUrl = data.flag?.url_png || data.flag?.url_svg || '';
          if (flagElement.tagName === 'IMG') {
            flagElement.src = flagUrl;
            flagElement.style.display = flagUrl ? 'block' : 'none';
          } else {
            flagElement.innerHTML = flagUrl
              ? `<img src="${flagUrl}" alt="${fallbackName} flag" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" />`
              : '';
          }
        }

        // Region / subtitle
        if (subtitleBlock && (data.region || data.subregion)) {
          subtitleBlock.style.display = 'flex';
          if (regionEl) regionEl.textContent = data.subregion || data.region || '';
        }

        // Languages, capital, currencies
        const languagesStr = Array.isArray(data.languages)
          ? data.languages.map(l => l.name).join(', ')
          : 'N/A';

        const capitalStr = data.capitals?.[0]?.name || 'N/A';

        let currenciesStr = 'N/A';
        if (Array.isArray(data.currencies)) {
          currenciesStr = data.currencies
            .map(c => `${c.name || ''}${c.symbol ? ` (${c.symbol})` : ''}`)
            .join(', ');
        }

        // Render the stats panel
      if (infoContainer) {
          infoContainer.innerHTML = `
            <div class="info-row">
              <span class="info-label">Capital:</span>
              <span class="info-value">${capitalStr}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Population:</span>
              <span class="info-value">${formatPopulation(data.population || rawPop)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Official languages:</span>
              <span class="info-value">${languagesStr}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Currency:</span>
              <span class="info-value">${currenciesStr}</span>
            </div>
            ${sovereignHtml}
            <div class="info-row">
              <span class="info-label">ISO Code:</span>
              <span class="info-value">${code3}</span>
            </div>
          `;
        }
      } else {
        console.warn(`REST Countries API HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  setupActionButtons(code3, fallbackName);
}

// ── HELPER FUNCTIONS ──

function formatPopulation(pop) {
  if (!pop || isNaN(pop)) return 'N/A';
  return Number(pop).toLocaleString();
}

function updateTimeMachineButton(countryCode, countryName) {
  const timeMachineBtn = document.getElementById('timeMachineBtn');
  if (!timeMachineBtn) return;

  import('./timemachine.js').then(mod => {
    if (mod.hasHistoricalData(countryCode)) {
      timeMachineBtn.style.display = 'flex';
      timeMachineBtn.onclick = () => showTimeMachineModal(countryCode, countryName);
    } else {
      timeMachineBtn.style.display = 'none';
    }
  }).catch(err => {
    console.error('Error loading TimeMachine module:', err);
    timeMachineBtn.style.display = 'none';
  });
}

function showTimeMachineModal(countryCode, countryName) {
  import('./timemachine.js').then(mod => {
    const periods = mod.getHistoricalPeriods(countryCode);
    if (periods.length === 0) return;

    const period = periods[0];
    const midYear = Math.floor((period.from + period.to) / 2);

    mod.showHistoricalPeriod(countryCode, midYear);

    alert(`🕰️ TimeMachine: Showing ${countryName} in ${midYear}\n${period.name} (${period.from}-${period.to})\n\nClick anywhere on the map to return to present day.`);

    if (timeMachineMap._timeMachineClickHandler) {
      timeMachineMap.off('click', timeMachineMap._timeMachineClickHandler);
    }

    const clickHandler = () => {
      mod.clearHistoricalLayers();
      timeMachineMap.off('click', clickHandler);
      timeMachineMap._timeMachineClickHandler = null;
    };

    timeMachineMap._timeMachineClickHandler = clickHandler;
    timeMachineMap.on('click', clickHandler);
  }).catch(err => {
    console.error('Error showing TimeMachine:', err);
  });
}

function setupActionButtons(countryCode, countryName) {
  const articlesBtn = document.getElementById('viewArticlesBtn');
  const timelineBtn = document.getElementById('viewTimelineBtn');

  if (articlesBtn) {
    articlesBtn.onclick = () => {
      window.location.href = `/articles.html?country=${encodeURIComponent(countryCode)}`;
    };
  }

  if (timelineBtn) {
    timelineBtn.onclick = () => {
      alert(`Timeline for ${countryName} (${countryCode}) coming soon!`);
    };
  }
}

export function closeSidebar() {
  const sidebar = document.getElementById('countrySidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }
  
  currentCountry = null;
}

export function setupSidebarHandlers() {
  const closeBtn = document.getElementById('closeSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentCountry) {
      closeSidebar();
    }
  });
}