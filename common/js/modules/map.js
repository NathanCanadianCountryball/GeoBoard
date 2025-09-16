import { body } from './dom.js';
import { applyTheme } from './theme.js';

export function setupMap() {
  console.log("Setting up Leaflet map");

  // Initialize map
  const map = L.map('map').setView([41.8902, 12.4922], 13); // Center on Roman Colosseum

  // Define light and dark mode tile layers
  const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    className: 'light-mode-map'
  });

  const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    className: 'dark-mode-map'
  });

  // Add initial tile layer based on theme
  const savedTheme = localStorage.getItem("geoTheme") || 'light';
  const initialTiles = savedTheme === 'dark' ? darkTiles : lightTiles;
  initialTiles.addTo(map);

  // Toggle map tiles on theme change
  document.addEventListener('themeChange', () => {
    const currentTheme = localStorage.getItem("geoTheme") || 'light';
    console.log(`Map tiles updating for theme: ${currentTheme}`);
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    const newTiles = currentTheme === 'dark' ? darkTiles : lightTiles;
    newTiles.addTo(map);
  });

  // Add marker for Roman Colosseum
  const marker = L.marker([41.8902, 12.4922]).addTo(map);
  marker.bindPopup("<b>Roman Colosseum</b><br>Built 70-80 AD").openPopup();

  // Ensure map resizes properly
  setTimeout(() => {
    map.invalidateSize();
    console.log("Map size invalidated for proper rendering");
  }, 100);

  console.log("Map initialized with center: [41.8902, 12.4922], zoom: 13");
}