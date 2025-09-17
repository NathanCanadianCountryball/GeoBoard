import {
  settingsBtn, settingsPanel, closeBtn,
  fontSlider, fontSizeValue, fontSelector
} from './dom.js';

export function setupSettingsPanel() {
  console.log("Setting up settings panel");
  
  // Open/close panel
  if (settingsBtn) {
    console.log("Settings button found:", settingsBtn);
    settingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Settings button clicked");
      settingsPanel?.classList.add("active");
    });
  } else {
    console.error("Settings button not found (li i.fa-cog parent)");
  }

  if (closeBtn) {
    console.log("Close button found:", closeBtn);
    closeBtn.addEventListener("click", () => {
      console.log("Close settings button clicked");
      settingsPanel?.classList.remove("active");
    });
  } else {
    console.error("Close button not found (id='closeSettings')");
  }

  if (settingsPanel) {
    console.log("Settings panel found:", settingsPanel);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        console.log("Escape key pressed");
        settingsPanel.classList.remove("active");
      }
    });
  } else {
    console.error("Settings panel not found (id='settingsPanel')");
  }

  // Font size logic
  const savedFontSize = localStorage.getItem("geoFontSize");
  if (savedFontSize) {
    console.log(`Found saved font size: ${savedFontSize}`);
    document.documentElement.style.setProperty("--font-size", savedFontSize + "px");
    if (fontSlider) {
      fontSlider.value = savedFontSize;
      console.log(`Font slider value set to: ${savedFontSize}`);
    } else {
      console.error("Font slider not found (id='fontSlider')");
    }
    if (fontSizeValue) {
      fontSizeValue.textContent = savedFontSize + "px";
      console.log(`Font size value set to: ${savedFontSize}px`);
    } else {
      console.error("Font size value element not found (id='fontSizeValue')");
    }
  } else {
    console.log("No saved font size found");
  }

  // Font size slider logic
  if (fontSlider && fontSizeValue) {
    fontSlider.addEventListener("input", () => {
      const fontSize = fontSlider.value;
      console.log(`Font size changed to: ${fontSize}px`);
      document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
      fontSizeValue.textContent = `${fontSize}px`;
      localStorage.setItem("geoFontSize", fontSize);
    });
  } else {
    console.error("Font slider or font size value element not found");
  }

  // Font selector logic
  if (fontSelector) {
    // Load saved font
    const savedFont = localStorage.getItem("geoFont");
    if (savedFont) {
      console.log(`Found saved font: ${savedFont}`);
      fontSelector.value = savedFont;
      if (savedFont === 'default') {
        document.body.style.fontFamily = '';
        document.querySelectorAll('h2, h3, p').forEach(el => {
          el.style.fontFamily = '';
        });
      } else {
        document.body.style.fontFamily = savedFont;
        document.querySelectorAll('h2, h3, p').forEach(el => {
          el.style.fontFamily = savedFont;
        });
      }
    } else {
      console.log("No saved font found");
    }

    fontSelector.addEventListener('change', function () {
      const selectedFont = this.value;
      console.log(`Font changed to: ${selectedFont}`);

      if (selectedFont === 'default') {
        document.body.style.fontFamily = '';
        document.querySelectorAll('h2, h3, p').forEach(el => {
          el.style.fontFamily = '';
        });
      } else {
        document.body.style.fontFamily = selectedFont;
        document.querySelectorAll('h2, h3, p').forEach(el => {
          el.style.fontFamily = selectedFont;
        });
      }

      // Save selected font to localStorage
      localStorage.setItem("geoFont", selectedFont);
      console.log(`Font saved to localStorage: ${selectedFont}`);
    });
  } else {
    console.error("Font selector not found (id='fontSelector')");
  }
}