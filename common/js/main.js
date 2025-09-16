import { setupThemeToggle } from './modules/theme.js';
import { setupSettingsPanel } from './modules/settings.js';
import { setupTimelineFeatures } from './modules/timeline.js';
import { setupMap } from './modules/map.js';

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupSettingsPanel();
  setupTimelineFeatures();

  const path = window.location.pathname.toLowerCase();

  // === Timeline Pages ===
  if (path.includes("timeline")) {
    import('./modules/timeline.js').then(mod => {
      mod?.setupTimeline?.(); // Optional chaining just in case
    });
  }

  // === Normal Articles ===
  else if (
    path.includes("normal")
  ) {
    import('./modules/normalarticle.js').then(mod => {
      mod?.setupArticle?.();
    });
  }

  // === Homepage ===
  else if (path.endsWith("index.html") || path === "/" || path === "/index") {
    console.log("Homepage detected. Initializing map and other modules.");
    setupMap(); // Initialize map for homepage
  }

  // === Default fallback ===
  else {
    console.log("No specialized JS module detected for this page.");
  }
});