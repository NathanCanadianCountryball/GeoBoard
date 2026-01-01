// Any additional article-specific functionality can go here
console.log("Articles page loaded successfully");
import { filterButtons } from './dom.js';

let activeFilter = null;

export function setupFilters() {
  console.log("=== SETUP FILTERS CALLED ===");
  console.log("filterButtons variable:", filterButtons);
  
  if (!filterButtons) {
    console.error("filterButtons is null or undefined!");
    
    // Try to find them manually
    const manualButtons = document.querySelectorAll('.filter-btn');
    console.log("Manually found buttons:", manualButtons.length);
    
    if (manualButtons.length > 0) {
      console.log("Using manually found buttons instead");
      setupFiltersManual(manualButtons);
      return;
    }
    return;
  }
  
  if (filterButtons.length === 0) {
    console.warn("filterButtons array is empty!");
    return;
  }
  
  console.log(`Found ${filterButtons.length} filter buttons from dom.js`);
  
  function applyFilter(tag) {
    const articles = document.querySelectorAll(".article-preview");
    const folders = document.querySelectorAll(".article-folder");
    
    console.log(`Applying filter: ${tag} to ${articles.length} articles`);
    
    // Filter articles
    articles.forEach(a => {
      const tags = (a.dataset.tags || '').toLowerCase();
      const matches = tags.includes(tag.toLowerCase());
      console.log(`Article tags: "${tags}" | Filter: "${tag}" | Match: ${matches}`);
      a.style.display = matches ? "block" : "none";
    });
    
    // Hide folders with no visible articles
    folders.forEach(folder => {
      const folderArticles = Array.from(folder.querySelectorAll('.article-preview'));
      const hasVisibleArticles = folderArticles.some(article => 
        window.getComputedStyle(article).display !== 'none'
      );
      folder.style.display = hasVisibleArticles ? 'block' : 'none';
    });
  }

  filterButtons.forEach((btn, index) => {
    console.log(`Setting up button ${index}:`, btn);
    
    btn.addEventListener("click", (e) => {
      console.log(`=== BUTTON ${index} CLICKED ===`);
      console.log("Button element:", btn);
      console.log("Event:", e);
      
      // Use data-filter attribute instead of textContent
      const filterValue = btn.getAttribute('data-filter') || btn.textContent.trim().toLowerCase();
      
      console.log(`Filter value: "${filterValue}"`);
      console.log(`Current activeFilter: "${activeFilter}"`);
      
      if (activeFilter === filterValue) {
        // Deactivate filter
        console.log("Deactivating filter");
        activeFilter = null;
        document.querySelectorAll(".article-preview").forEach(a => a.style.display = "block");
        document.querySelectorAll(".article-folder").forEach(f => f.style.display = "block");
        filterButtons.forEach(b => b.classList.remove("active"));
      } else {
        // Activate filter
        console.log(`Activating filter: ${filterValue}`);
        activeFilter = filterValue;
        applyFilter(filterValue);
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        console.log("Active class added to button");
      }
    });
  });
  
  console.log("=== Filters setup complete! ===");
}

// Fallback function if dom.js doesn't work
function setupFiltersManual(buttons) {
  console.log("=== USING MANUAL SETUP ===");
  
  buttons.forEach((btn, index) => {
    console.log(`Manually setting up button ${index}`);
    
    btn.addEventListener("click", () => {
      console.log(`Manual button ${index} clicked`);
      const filterValue = btn.getAttribute('data-filter') || btn.textContent.trim().toLowerCase();
      console.log(`Filter: ${filterValue}`);
      
      if (activeFilter === filterValue) {
        activeFilter = null;
        document.querySelectorAll(".article-preview").forEach(a => a.style.display = "block");
        document.querySelectorAll(".article-folder").forEach(f => f.style.display = "block");
        buttons.forEach(b => b.classList.remove("active"));
      } else {
        activeFilter = filterValue;
        
        const articles = document.querySelectorAll(".article-preview");
        articles.forEach(a => {
          const tags = (a.dataset.tags || '').toLowerCase();
          const matches = tags.includes(filterValue.toLowerCase());
          a.style.display = matches ? "block" : "none";
        });
        
        const folders = document.querySelectorAll(".article-folder");
        folders.forEach(folder => {
          const folderArticles = Array.from(folder.querySelectorAll('.article-preview'));
          const hasVisibleArticles = folderArticles.some(article => 
            window.getComputedStyle(article).display !== 'none'
          );
          folder.style.display = hasVisibleArticles ? 'block' : 'none';
        });
        
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });
}