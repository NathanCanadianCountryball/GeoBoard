export const translations = {
  en: {
    filters: "Filters",
    articles: "Articles",
    noResults: "No results found. Try another filter or clear the search.",
    settings: "Settings",
    fontSize: "Font Size",
    fontStyle: "Font Style",
  },
  es: {
    filters: "Filtros",
    articles: "Artículos",
    noResults: "No se encontraron resultados. Prueba otro filtro o borra la búsqueda.",
    settings: "Configuraciones",
    fontSize: "Tamaño de letra",
    fontStyle: "Estilo de letra",
  }
};

export function setupLanguageToggle() {
  const selector = document.getElementById("languageSelector");
  
  // If selector doesn't exist, exit early
  if (!selector) {
    console.warn("Language selector not found on this page.");
    return;
  }
  
  const userLang = localStorage.getItem("geoboard-lang") || "en";

  selector.value = userLang;
  applyLanguage(userLang);

  selector.addEventListener("change", () => {
    const lang = selector.value;
    localStorage.setItem("geoboard-lang", lang);
    applyLanguage(lang);
  });
}

function applyLanguage(lang) {
  const t = translations[lang];

  // Update static text (with null checks to prevent errors)
  const filterSection = document.querySelector(".filter-section h2");
  if (filterSection) filterSection.textContent = t.filters;

  const articlesMenu = document.querySelector(".articles-menu h2");
  if (articlesMenu) articlesMenu.textContent = t.articles;

  const noResults = document.getElementById("noResultsMessage");
  if (noResults) noResults.textContent = t.noResults;

  const settingsPanel = document.querySelector("#settingsPanel h2");
  if (settingsPanel) settingsPanel.textContent = t.settings;

  const fontSizeLabel = document.querySelector('label[for="fontSlider"]');
  if (fontSizeLabel) fontSizeLabel.textContent = t.fontSize;

  const fontStyleLabel = document.querySelector('label[for="fontSelector"]');
  if (fontStyleLabel) fontStyleLabel.textContent = t.fontStyle;
}