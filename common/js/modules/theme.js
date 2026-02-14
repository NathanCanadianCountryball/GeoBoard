import { body, toggle } from './dom.js';
import { setMapTheme } from './map.js';

export function applyTheme(theme) {
  console.log(`=== Applying ${theme} theme ===`);
  
  // Update class and storage
  body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("geoTheme", theme);

  // Swap logo
  const logo = document.getElementById("geoLogo");
  if (logo) {
    logo.src = theme === "dark"
      ? "/assets/media/GeoBoardIconDark.svg"
      : "/assets/media/GeoBoardIcon.svg";
  }

  // Update map theme if map exists (only on homepage)
  try {
    setMapTheme(theme);
  } catch (error) {
    // Map not initialized on this page, that's fine
  }

  // Dispatch theme change event for any other listeners
  document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
}

export function setupThemeToggle() {
  const savedTheme = localStorage.getItem("geoTheme");
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  if (toggle) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const currentTheme = body.classList.contains("dark") ? "dark" : "light";
      const next = currentTheme === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  } else {
    console.error("Toggle element not found (id='darkModeToggle')");
  }
}