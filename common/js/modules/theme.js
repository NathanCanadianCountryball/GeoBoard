import { body, toggle } from './dom.js';

export function applyTheme(theme) {
  console.log(`Applying theme: ${theme}`);
  // Update class and storage
  body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("geoTheme", theme);

  // Swap logo
  const logo = document.getElementById("geoLogo");
  if (logo) {
    logo.src = theme === "dark"
      ? "/assets/media/GeoBoardIconDark.svg"
      : "/assets/media/GeoBoardIcon.svg";
    console.log(`Logo updated to: ${logo.src}`);
  } else {
    console.error("Logo element not found (id='geoLogo')");
  }

  // Toggle map visibility if present
  const lightMap = document.querySelector(".light-mode-map");
  const darkMap = document.querySelector(".dark-mode-map");

  if (lightMap && darkMap) {
    lightMap.style.display = theme === "dark" ? "none" : "block";
    darkMap.style.display = theme === "dark" ? "block" : "none";
    console.log(`Map visibility toggled: lightMap=${lightMap.style.display}, darkMap=${darkMap.style.display}`);
  } else {
    console.warn("Map elements not found (light-mode-map or dark-mode-map)");
  }

  // Dispatch theme change event for map tiles
  document.dispatchEvent(new CustomEvent('themeChange'));
}

export function setupThemeToggle() {
  console.log("Setting up theme toggle");
  const savedTheme = localStorage.getItem("geoTheme");
  if (savedTheme) {
    console.log(`Found saved theme: ${savedTheme}`);
    applyTheme(savedTheme);
  } else {
    console.log("No saved theme found");
  }

  if (toggle) {
    console.log("Toggle element found:", toggle);
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Dark mode toggle clicked");
      const next = body.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
    });
  } else {
    console.error("Toggle element not found (id='darkModeToggle')");
  }
}