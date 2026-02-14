let currentCountry = null;
let currentCountryCode = null;
let hoveredCountryId = null;
let timeMachineMap = null;
let countryLayersActive = true;

// Zoom threshold - interactions disabled below this zoom level
const ZOOM_THRESHOLD = 3.5;

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
    setupEventHandlers();
    setupZoomToggle();
  } else {
    map.once('load', () => {
      addCountryLayers(map);
      setupEventHandlers();
      setupZoomToggle();
    });
  }
}

function showCountrySidebar(properties) {
  const sidebar = document.getElementById('countrySidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (!sidebar || !overlay) {
    console.error('Sidebar elements not found');
    return;
  }

  // Extract country data using the actual property names from the vector tiles
  const name = properties.NAME || properties.name || properties.ADMIN || 'Unknown';
  const code3 = properties.ADM0_A3 || properties.iso_a3 || '';
  const code2 = properties.ISO_A2 || properties.iso_a2 || convertISO3toISO2(code3);
  const population = properties.POP_EST || properties.pop_est || null;
  
  // Populate sidebar - name at top
  const nameElement = document.getElementById('countryName');
  const flagElement = document.getElementById('countryFlag');
  
  if (nameElement) {
    nameElement.textContent = name;
  }
  
  if (flagElement) {
    if (code2) {
      flagElement.src = `https://flagcdn.com/w320/${code2.toLowerCase()}.png`;
      flagElement.alt = `${name} flag`;
      flagElement.style.display = 'block';
    } else {
      flagElement.style.display = 'none';
    }
  }
  
  // Show additional info
  const infoContainer = document.getElementById('countryInfo');
  if (infoContainer) {
    infoContainer.innerHTML = `
      ${code3 ? `
      <div class="info-row">
        <span class="info-label">ISO Code:</span>
        <span class="info-value">${code3}</span>
      </div>
      ` : ''}
      ${population ? `
      <div class="info-row">
        <span class="info-label">Population:</span>
        <span class="info-value">${formatPopulation(population)}</span>
      </div>
      ` : ''}
    `;
  }
  
  // Check if this country has historical data and update TimeMachine button
  updateTimeMachineButton(code3, name);

  // Show sidebar and overlay
  sidebar.classList.add('active');
  overlay.classList.add('active');
  
  currentCountry = name;
  currentCountryCode = code3;
  console.log(`Showing: ${name}`);
}

// Helper function to format population with commas
function formatPopulation(pop) {
  if (!pop) return 'N/A';
  return Number(pop).toLocaleString();
}

// Update TimeMachine button visibility and handler
function updateTimeMachineButton(countryCode, countryName) {
  const timeMachineBtn = document.getElementById('timeMachineBtn');
  if (!timeMachineBtn) {
    console.log('TimeMachine button element not found');
    return;
  }
  
  console.log(`Checking TimeMachine data for ${countryCode}`);
  
  // Check if this country has historical data
  import('./timemachine.js').then(mod => {
    console.log('TimeMachine module loaded');
    if (mod.hasHistoricalData(countryCode)) {
      console.log(`✓ ${countryCode} has historical data - showing button`);
      timeMachineBtn.style.display = 'flex';
      timeMachineBtn.onclick = () => showTimeMachineModal(countryCode, countryName);
    } else {
      console.log(`${countryCode} has no historical data`);
      timeMachineBtn.style.display = 'none';
    }
  }).catch(err => {
    console.error('Error loading TimeMachine module:', err);
    timeMachineBtn.style.display = 'none';
  });
}

// Show TimeMachine modal with year slider
function showTimeMachineModal(countryCode, countryName) {
  console.log(`Opening TimeMachine for ${countryName}`);
  
  import('./timemachine.js').then(mod => {
    const periods = mod.getHistoricalPeriods(countryCode);
    if (periods.length === 0) return;
    
    // For now, just show the first period (1949-1990 for Germany)
    const period = periods[0];
    const midYear = Math.floor((period.from + period.to) / 2);
    
    mod.showHistoricalPeriod(countryCode, midYear);
    
    // Show notification
    alert(`🕰️ TimeMachine: Showing ${countryName} in ${midYear}
${period.name} (${period.from}-${period.to})

${period.states ? period.states.map(s => s.name).join(' & ') : ''}

Click anywhere on the map to return to present day.`);
    
    // Add one-time click handler to clear historical view
    // Remove any existing handler first
    if (timeMachineMap._timeMachineClickHandler) {
      timeMachineMap.off('click', timeMachineMap._timeMachineClickHandler);
    }
    
    // Create new handler
    const clickHandler = () => {
      mod.clearHistoricalLayers();
      console.log('Returned to present day');
      // Remove this handler after use
      timeMachineMap.off('click', clickHandler);
      timeMachineMap._timeMachineClickHandler = null;
    };
    
    // Store reference and attach
    timeMachineMap._timeMachineClickHandler = clickHandler;
    timeMachineMap.on('click', clickHandler);
  }).catch(err => {
    console.error('Error showing TimeMachine:', err);
  });
}

// Helper function to convert ISO3 to ISO2 codes for common countries
function convertISO3toISO2(iso3) {
  const iso3to2 = {
    // Europe
    'POL': 'PL', 'GBR': 'GB', 'FRA': 'FR', 'DEU': 'DE', 'ITA': 'IT', 'ESP': 'ES',
    'PRT': 'PT', 'NLD': 'NL', 'BEL': 'BE', 'CHE': 'CH', 'AUT': 'AT', 'SWE': 'SE',
    'NOR': 'NO', 'DNK': 'DK', 'FIN': 'FI', 'ISL': 'IS', 'IRL': 'IE', 'GRC': 'GR',
    'TUR': 'TR', 'RUS': 'RU', 'UKR': 'UA', 'BLR': 'BY', 'ROU': 'RO', 'BGR': 'BG',
    'HUN': 'HU', 'CZE': 'CZ', 'SVK': 'SK', 'HRV': 'HR', 'SVN': 'SI', 'SRB': 'RS',
    'BIH': 'BA', 'MKD': 'MK', 'ALB': 'AL', 'EST': 'EE', 'LVA': 'LV', 'LTU': 'LT',
    'MDA': 'MD', 'MNE': 'ME', 'LUX': 'LU', 'MLT': 'MT', 'CYP': 'CY', 'AND': 'AD',
    'MCO': 'MC', 'SMR': 'SM', 'VAT': 'VA', 'LIE': 'LI', 'GEO': 'GE', 'ARM': 'AM',
    'AZE': 'AZ', 'KOS': 'XK',
    
    // Americas
    'USA': 'US', 'CAN': 'CA', 'MEX': 'MX', 'BRA': 'BR', 'ARG': 'AR', 'CHL': 'CL',
    'PER': 'PE', 'COL': 'CO', 'VEN': 'VE', 'ECU': 'EC', 'BOL': 'BO', 'PRY': 'PY',
    'URY': 'UY', 'GUY': 'GY', 'SUR': 'SR', 'GUF': 'GF', 'CRI': 'CR', 'PAN': 'PA',
    'NIC': 'NI', 'HND': 'HN', 'SLV': 'SV', 'GTM': 'GT', 'BLZ': 'BZ', 'CUB': 'CU',
    'JAM': 'JM', 'HTI': 'HT', 'DOM': 'DO', 'PRI': 'PR', 'TTO': 'TT', 'BHS': 'BS',
    'BRB': 'BB', 'GRD': 'GD', 'VCT': 'VC', 'LCA': 'LC', 'DMA': 'DM', 'ATG': 'AG',
    'KNA': 'KN',
    
    // Asia
    'CHN': 'CN', 'JPN': 'JP', 'KOR': 'KR', 'PRK': 'KP', 'IND': 'IN', 'PAK': 'PK',
    'BGD': 'BD', 'IDN': 'ID', 'THA': 'TH', 'VNM': 'VN', 'PHL': 'PH', 'MYS': 'MY',
    'SGP': 'SG', 'MMR': 'MM', 'LAO': 'LA', 'KHM': 'KH', 'TWN': 'TW', 'HKG': 'HK',
    'MAC': 'MO', 'MNG': 'MN', 'NPL': 'NP', 'LKA': 'LK', 'BTN': 'BT', 'MDV': 'MV',
    'BRN': 'BN', 'TLS': 'TL', 'AFG': 'AF', 'KAZ': 'KZ', 'UZB': 'UZ', 'TKM': 'TM',
    'KGZ': 'KG', 'TJK': 'TJ',
    
    // Middle East
    'ARE': 'AE', 'SAU': 'SA', 'IRN': 'IR', 'IRQ': 'IQ', 'ISR': 'IL', 'JOR': 'JO',
    'LBN': 'LB', 'SYR': 'SY', 'YEM': 'YE', 'OMN': 'OM', 'KWT': 'KW', 'QAT': 'QA',
    'BHR': 'BH', 'PSE': 'PS',
    
    // Africa
    'ZAF': 'ZA', 'EGY': 'EG', 'NGA': 'NG', 'KEN': 'KE', 'ETH': 'ET', 'TZA': 'TZ',
    'UGA': 'UG', 'GHA': 'GH', 'DZA': 'DZ', 'MAR': 'MA', 'TUN': 'TN', 'LBY': 'LY',
    'SDN': 'SD', 'SSD': 'SS', 'AGO': 'AO', 'MOZ': 'MZ', 'MDG': 'MG', 'CMR': 'CM',
    'CIV': 'CI', 'NER': 'NE', 'BFA': 'BF', 'MLI': 'ML', 'SEN': 'SN', 'TCD': 'TD',
    'SOM': 'SO', 'ZWE': 'ZW', 'ZMB': 'ZM', 'MWI': 'MW', 'BWA': 'BW', 'NAM': 'NA',
    'LSO': 'LS', 'SWZ': 'SZ', 'GAB': 'GA', 'GNQ': 'GQ', 'COG': 'CG', 'COD': 'CD',
    'CAF': 'CF', 'TGO': 'TG', 'BEN': 'BJ', 'MRT': 'MR', 'GMB': 'GM', 'GNB': 'GW',
    'GIN': 'GN', 'SLE': 'SL', 'LBR': 'LR', 'ERI': 'ER', 'DJI': 'DJ', 'RWA': 'RW',
    'BDI': 'BI', 'MUS': 'MU', 'SYC': 'SC', 'CPV': 'CV', 'STP': 'ST', 'COM': 'KM',
    
    // Oceania
    'AUS': 'AU', 'NZL': 'NZ', 'PNG': 'PG', 'FJI': 'FJ', 'SLB': 'SB', 'VUT': 'VU',
    'NCL': 'NC', 'PYF': 'PF', 'WSM': 'WS', 'GUM': 'GU', 'TON': 'TO', 'KIR': 'KI',
    'FSM': 'FM', 'MHL': 'MH', 'PLW': 'PW', 'NRU': 'NR', 'TUV': 'TV', 'NIU': 'NU',
    'COK': 'CK', 'ASM': 'AS'
  };
  
  return iso3to2[iso3] || '';
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

// Setup close handlers
export function setupSidebarHandlers() {
  const closeBtn = document.getElementById('closeSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }
  
  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentCountry) {
      closeSidebar();
    }
  });
}