export const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
};
// Removed duplicate setupMap function

let mapInstance = null;

export function setupMap() {
  // Check for saved theme
  const savedTheme = localStorage.getItem("geoTheme") || "light";
  const initialStyle = savedTheme === "dark"
    ? MAP_STYLES.dark
    : MAP_STYLES.light;

  const map = new maplibregl.Map({
    container: "map",
    style: initialStyle,
    center: [0, 20],
    zoom: 2
  });

  mapInstance = map;
  console.log(`Map initialized with ${savedTheme} theme`);
  
  // Setup country interactions after map loads
  map.on('load', () => {
    import('./countries.js').then(mod => {
      mod.setupCountryInteractions(map);
      mod.setupSidebarHandlers();
    }).catch(err => {
      console.error('Error loading countries module:', err);
    });
  });
  
  return map;
}

export function setMapTheme(theme) {
  console.log(`=== Switching to ${theme} mode ===`);
  
  if (!mapInstance) {
    console.warn("Map not initialized yet");
    return;
  }

  const style = theme === "dark"
      ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  
  mapInstance.setStyle(style);
  
  // Wait for style to fully load, then reinitialize
  waitForStyleLoad(mapInstance);
}

// Helper function to wait for style to be fully loaded
function waitForStyleLoad(map) {
  const checkAndReinit = () => {
    if (map.isStyleLoaded()) {
      console.log("✓ Map style loaded, reinitializing interactions");
      
      import('./countries.js').then(mod => {
        mod.setupCountryInteractions(map);
      }).catch(err => {
        console.error("Error importing countries.js:", err);
      });
    } else {
      setTimeout(checkAndReinit, 100);
    }
  };
  
  setTimeout(checkAndReinit, 100);
}