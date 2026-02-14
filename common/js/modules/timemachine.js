import { historicalData } from './historicaldata.js';

let currentMap = null;
let activeHistoricalLayers = [];

export function setupTimeMachine(map) {
  currentMap = map;
  console.log('✓ TimeMachine initialized');
}

export function showHistoricalPeriod(countryCode, year) {
  console.log(`=== TimeMachine: ${countryCode} at year ${year} ===`);
  
  const country = historicalData[countryCode];
  if (!country) {
    console.log('No historical data for this country');
    return null;
  }
  
  // Find the period that matches this year
  const period = country.periods.find(p => year >= p.from && year <= p.to);
  if (!period) {
    console.log('No period found for this year');
    return null;
  }
  
  console.log(`Found period: ${period.name} (${period.from}-${period.to})`);
  
  // IMPORTANT: Clear any existing historical layers FIRST
  clearHistoricalLayers();
  
  // Wait longer and verify sources are gone before adding new ones
  const addLayers = () => {
    // Double-check sources are actually removed
    const sourceStillExists = currentMap.getSource('historical-state-0');
    if (sourceStillExists) {
      console.log('Sources still exist, waiting longer...');
      setTimeout(addLayers, 100);
      return;
    }
    
    // Add the historical boundaries
    if (period.states) {
      period.states.forEach((state, index) => {
        addHistoricalState(state, index);
      });
    }
  };
  
  setTimeout(addLayers, 200);
  
  return period;
}

function addHistoricalState(state, index) {
  if (!currentMap) return;
  
  const sourceId = `historical-state-${index}`;
  const fillLayerId = `historical-fill-${index}`;
  const lineLayerId = `historical-line-${index}`;
  
  // If geometryUrl is provided, fetch the GeoJSON file
  if (state.geometryUrl) {
    console.log(`Fetching geometry from: ${state.geometryUrl}`);
    fetch(state.geometryUrl)
      .then(response => response.json())
      .then(geojsonData => {
        // Add source with fetched data
        currentMap.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData
        });
        
        // Add fill layer
        currentMap.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': state.color,
            'fill-opacity': 0.4
          }
        });
        
        // Add border layer
        currentMap.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': state.color,
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
        
        // Track these layers
        activeHistoricalLayers.push(sourceId, fillLayerId, lineLayerId);
        
        console.log(`Added historical state: ${state.name}`);
      })
      .catch(err => {
        console.error(`Error loading ${state.name} geometry:`, err);
      });
  } else if (state.geometry) {
    // Fallback: use inline geometry if provided
    currentMap.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          name: state.name,
          fullName: state.fullName
        },
        geometry: state.geometry
      }
    });
    
    // Add fill layer
    currentMap.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': state.color,
        'fill-opacity': 0.4
      }
    });
    
    // Add border layer
    currentMap.addLayer({
      id: lineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': state.color,
        'line-width': 3,
        'line-opacity': 0.8
      }
    });
    
    // Track these layers
    activeHistoricalLayers.push(sourceId, fillLayerId, lineLayerId);
    
    console.log(`Added historical state: ${state.name}`);
  }
}

export function clearHistoricalLayers() {
  if (!currentMap) return;
  
  console.log('Clearing historical layers...');
  
  // Remove layers first, then sources
  activeHistoricalLayers.forEach(id => {
    try {
      if (currentMap.getLayer(id)) {
        currentMap.removeLayer(id);
        console.log(`Removed layer: ${id}`);
      }
    } catch (e) {
      console.warn(`Could not remove layer ${id}:`, e);
    }
  });
  
  // Now remove sources
  activeHistoricalLayers.forEach(id => {
    try {
      if (currentMap.getSource(id)) {
        currentMap.removeSource(id);
        console.log(`Removed source: ${id}`);
      }
    } catch (e) {
      console.warn(`Could not remove source ${id}:`, e);
    }
  });
  
  activeHistoricalLayers = [];
  console.log('✓ Historical layers cleared');
}

export function hasHistoricalData(countryCode) {
  return !!historicalData[countryCode];
}

export function getHistoricalPeriods(countryCode) {
  const country = historicalData[countryCode];
  return country ? country.periods : [];
}