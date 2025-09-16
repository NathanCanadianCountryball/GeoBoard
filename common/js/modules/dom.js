// modules/dom.js

// 🌐 General
export const body = document.body;
export const logo = document.getElementById("geoLogo");
export const splash = document.getElementById("loaderOverlay");

// 🎨 Theme
export const toggle = document.getElementById("darkModeToggle");

// ⚙️ Settings
// Directly grab the <li> with settings by checking for the settings icon
export const settingsBtn = [...document.querySelectorAll("li")]
  .find(li => li.querySelector("i.fa-cog"));
export const settingsPanel = document.getElementById("settingsPanel");
export const closeBtn = document.getElementById("closeSettings");
export const fontSlider = document.getElementById("fontSlider");
export const fontSizeValue = document.getElementById("fontSizeValue");
export const fontSelector = document.getElementById("fontSelector");

// 📄 Layout
export const mainContent = document.querySelector(".main-content");
export const topbar = document.querySelector(".topbar");

// Optional timeline stuff
export const timelineItems = document.querySelectorAll(".timeline li");
export const toggleButtons = document.querySelectorAll(".toggle-btn");
export const filterButtons = document.querySelectorAll(".filter-btn");
