import { setupThemeToggle } from './modules/theme.js';
import { setupSettingsPanel } from './modules/settings.js';
import { setupMap } from './modules/map.js';
import { setupFilters } from './modules/articles.js';
import { setupLanguageToggle } from './modules/lang.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("=== MAIN.JS: DOMContentLoaded fired ===");
  
  // Global setup (runs on all pages)
  setupThemeToggle();
  setupSettingsPanel();
  
  // Only setup language toggle if the selector exists
  if (document.getElementById("languageSelector")) {
    setupLanguageToggle();
  }

  // Page detection
  const path = window.location.pathname.toLowerCase();
  console.log("Current path:", path);

  // Check if page has timeline elements
  const hasTimeline = document.querySelector('.timeline') !== null;
  const hasTimelineItems = document.querySelector('.timeline-item') !== null;
  console.log("Has .timeline element:", hasTimeline);
  console.log("Has .timeline-item elements:", hasTimelineItems);

  // === Timeline Pages (detected by presence of timeline elements) ===
  if (hasTimeline || hasTimelineItems) {
    console.log("✓ Timeline page detected. Loading timeline module.");
    import('./modules/timeline.js').then(mod => {
      if (mod && mod.setupTimelineFeatures) {
        mod.setupTimelineFeatures();
        console.log("✓ Timeline features loaded successfully");
      } else {
        console.error("Failed to load setupTimelineFeatures from timeline.js");
      }
    }).catch(err => {
      console.error("Error loading timeline.js:", err);
    });
  }

  // === Articles Page ===
  else if (path.includes("articles.html") || path.includes("/articles")) {
    console.log("✓ Articles page detected. Setting up article features.");
    setupFilters();           // Article filter buttons
    setupFolderToggles();     // Folder opening
  }

  // === Normal Articles ===
  else if (path.includes("normal")) {
    console.log("✓ Normal article page detected.");
    import('./modules/normalarticle.js').then(mod => {
      mod?.setupArticle?.();
    });
  }

  // === Homepage ===
  else if (path.endsWith("index.html") || path === "/" || path.endsWith("/index")) {
    console.log("✓ Homepage detected. Initializing map.");
    setupMap();
  }

  // === Default fallback ===
  else {
    console.log("⚠ No specialized JS module detected for this page.");
    console.log("Path:", path);
    console.log("Has timeline:", hasTimeline || hasTimelineItems);
  }
});

// ————————————————————————————————————————————
// Folder Toggle Functionality
// Handles opening and closing article folders
// ————————————————————————————————————————————
function setupFolderToggles() {
  console.log("Setting up folder toggles...");
  const folderToggles = document.querySelectorAll(".folder-toggle");
  console.log("Found folder toggles:", folderToggles.length);
  
  folderToggles.forEach(btn => {
    btn.addEventListener("click", () => {
      const content = btn.nextElementSibling;
      content.classList.toggle("open");
    });
  });
}