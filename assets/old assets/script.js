console.log("GeoBoard JS loaded.");

document.addEventListener("DOMContentLoaded", () => {
  // ————————————————————————————————————————————
  // 1) COMMON DOM ELEMENTS
  // ————————————————————————————————————————————
  const body            = document.body;
  const logo            = document.getElementById("geoLogo");
  const toggle          = document.getElementById("darkModeToggle");
  const settingsBtn     = document.querySelector("li i.fa-cog")?.parentElement;
  const settingsPanel   = document.getElementById("settingsPanel");
  const closeBtn        = document.getElementById("closeSettings");
  const fontSlider      = document.getElementById("fontSlider");
  const fontSizeValue   = document.getElementById("fontSizeValue");
  const articlesBtn     = document.getElementById("articlesBtn");
  const articlesMenu    = document.getElementById("articlesMenu");
  const mainContent     = document.querySelector(".main-content");
  const closeArticles   = document.getElementById("closeArticles");
  const topbar          = document.querySelector(".topbar");
  const timelineItems   = document.querySelectorAll(".timeline li");
  const toggleButtons   = document.querySelectorAll(".toggle-btn");
  const filterButtons   = document.querySelectorAll(".filter-btn");
  const splash          = document.getElementById("loaderOverlay");
  let   activeFilter    = null;

  // Some paths to detect page type:
  const path            = window.location.pathname;
  const fromReferrer    = document.referrer;
  const isArticlesPage  = path.endsWith("articles.html");
  const isArticlePage   = /\.html$/.test(path) && !path.endsWith("index.html") && !isArticlesPage;
  const cameFromArticles= fromReferrer.includes("articles.html");

  // ————————————————————————————————————————————
  // 2) THEME & SETTINGS PANEL
  // ————————————————————————————————————————————
  const savedTheme = localStorage.getItem("geoTheme");
  if (savedTheme) applyTheme(savedTheme);

  toggle?.addEventListener("click", () => {
    const next = body.classList.toggle("dark") ? "dark" : "light";
    localStorage.setItem("geoTheme", next);
    applyTheme(next);
  });

  function applyTheme(t) {
    body.classList.toggle("dark", t === "dark");
    if (logo) {
      logo.src = t === "dark"
        ? "Assets/Media/GeoBoardIconDark.svg"
        : "Assets/Media/GeoBoardIcon.svg";
    }
    const lightMap = document.querySelector(".light-mode-map"),
          darkMap  = document.querySelector(".dark-mode-map");
    if (lightMap && darkMap) {
      lightMap.style.display = t === "dark" ? "none" : "block";
      darkMap.style.display  = t === "dark" ? "block" : "none";
    }
  }

  if (settingsBtn && settingsPanel && closeBtn) {
    settingsBtn.addEventListener("click", () => settingsPanel.classList.add("active"));
    closeBtn.addEventListener("click", () => settingsPanel.classList.remove("active"));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") settingsPanel.classList.remove("active");
    });
  }

  // ————————————————————————————————————————————
  // 3) FONT SIZE SLIDER
  // ————————————————————————————————————————————
  const savedFontSize = localStorage.getItem("geoFontSize");
  if (savedFontSize) {
    document.documentElement.style.setProperty("--font-size", savedFontSize + "px");
    fontSlider.value      = savedFontSize;
    fontSizeValue.textContent = savedFontSize + "px";
  }

  fontSlider?.addEventListener("input", () => {
    const size = fontSlider.value;
    document.documentElement.style.setProperty("--font-size", size + "px");
    fontSizeValue.textContent = size + "px";
    localStorage.setItem("geoFontSize", size);
  });

  // ————————————————————————————————————————————
  // 4) ARTICLES PANEL SLIDE-IN (SLIDE-OUT IS ON CLICK)
  // ————————————————————————————————————————————
  if (articlesBtn && articlesMenu && mainContent && closeArticles && topbar) {
    articlesBtn.addEventListener("click", () => {
      articlesMenu.classList.add("active");
      mainContent.classList.add("slide-out");
      topbar.style.display = "none";
    });
    closeArticles.addEventListener("click", () => {
      articlesMenu.classList.remove("active");
      mainContent.classList.remove("slide-out");
      topbar.style.display = "flex";
    });
  }

  // ————————————————————————————————————————————
  // 5) SCROLL-REVEAL for timelines
  // ————————————————————————————————————————————
  function revealOnScroll() {
    timelineItems.forEach(item => {
      if (item.getBoundingClientRect().top < window.innerHeight - 100) {
        item.classList.add("visible");
      }
    });
  }
  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load", revealOnScroll);

  // ————————————————————————————————————————————
  // 6) EXPANDABLE TIMELINE ITEMS
  // ————————————————————————————————————————————
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const item     = btn.closest(".timeline-item");
      const currently = item.classList.contains("active");
      document.querySelectorAll(".timeline-item.active").forEach(i => {
        i.classList.remove("active");
        i.querySelector(".toggle-btn").textContent = "+";
      });
      if (!currently) {
        item.classList.add("active");
        btn.textContent = "−";
      }
    });
  });

  // ————————————————————————————————————————————
  // 7) FILTER BUTTON LOGIC
  // ————————————————————————————————————————————
  function applyFilter(tag) {
    document.querySelectorAll(".article-preview").forEach(a => {
      a.style.display = a.dataset.tags.toLowerCase().includes(tag) ? "block" : "none";
    });
  }
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const t = btn.textContent.toLowerCase();
      if (activeFilter === t) {
        activeFilter = null;
        document.querySelectorAll(".article-preview").forEach(a => a.style.display = "block");
        filterButtons.forEach(b => b.classList.remove("active"));
      } else {
        activeFilter = t;
        applyFilter(t);
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });
});