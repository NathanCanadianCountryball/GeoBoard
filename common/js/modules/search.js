// search.js - Dedicated search functionality for GeoBoard articles
let currentSearch = '';
let activeFilter = null;

// Debounce utility to prevent excessive filtering
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check if article matches search term
function matchesSearch(articleEl, searchTerm) {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase().trim();
  if (!term) return true;
  
  // Get searchable content
  const title = (articleEl.querySelector('h3')?.textContent || '').toLowerCase();
  const description = (articleEl.querySelector('p')?.textContent || '').toLowerCase();
  const tags = (articleEl.dataset.tags || '').toLowerCase();
  
  // Check if any content matches the search term
  return title.includes(term) || 
         description.includes(term) || 
         tags.includes(term);
}

// Check if article matches active filter
function matchesFilter(articleEl, filterTag) {
  if (!filterTag) return true;
  
  const tags = (articleEl.dataset.tags || '').toLowerCase();
  return tags.includes(filterTag.toLowerCase());
}

// Update visibility of articles based on search and filter
function updateArticleVisibility() {
  const searchTerm = currentSearch.trim();
  const filterTag = activeFilter;
  
  // Get all articles and folders
  const articles = Array.from(document.querySelectorAll('.article-preview'));
  const folders = Array.from(document.querySelectorAll('.article-folder'));
  const noResultsMessage = document.getElementById('noResultsMessage');
  
  let hasVisibleContent = false;
  
  // Update individual article visibility
  articles.forEach(article => {
    const matchesSearchCriteria = matchesSearch(article, searchTerm);
    const matchesFilterCriteria = matchesFilter(article, filterTag);
    const shouldShow = matchesSearchCriteria && matchesFilterCriteria;
    
    article.style.display = shouldShow ? 'block' : 'none';
    
    if (shouldShow) hasVisibleContent = true;
  });
  
  // Handle folder visibility
  folders.forEach(folder => {
    const folderArticles = Array.from(folder.querySelectorAll('.article-preview'));
    const hasVisibleArticles = folderArticles.some(article => 
      window.getComputedStyle(article).display !== 'none'
    );
    
    folder.style.display = hasVisibleArticles ? 'block' : 'none';
    
    if (hasVisibleArticles) hasVisibleContent = true;
  });
  
  // Show/hide no results message
  if (noResultsMessage) {
    if (hasVisibleContent) {
      noResultsMessage.classList.remove('show');
      noResultsMessage.style.display = 'none';
    } else {
      noResultsMessage.classList.add('show');
      noResultsMessage.style.display = 'block';
    }
  }
}

// Setup search input functionality
function setupSearchInput() {
  const searchInput = document.getElementById('articleSearch');
  const clearButton = document.getElementById('clearSearch');
  
  if (!searchInput) {
    console.warn('Search input not found');
    return;
  }
  
  // Debounced update function
  const debouncedUpdate = debounce(updateArticleVisibility, 200);
  
  // Handle search input
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    debouncedUpdate();
    
    // Show/hide clear button
    if (clearButton) {
      clearButton.style.display = currentSearch ? 'block' : 'none';
    }
  });
  
  // Handle clear button
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      currentSearch = '';
      searchInput.value = '';
      clearButton.style.display = 'none';
      updateArticleVisibility();
      searchInput.focus(); // Keep focus for better UX
    });
    
    // Initially hide clear button
    clearButton.style.display = 'none';
  }
  
  // Handle Enter key for search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateArticleVisibility();
    }
  });
}

// Setup filter functionality
function setupFilters() {
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  
  if (filterButtons.length === 0) {
    console.warn('No filter buttons found');
    return;
  }
  
  console.log('Filter buttons found:', filterButtons.length);
  
  const debouncedUpdate = debounce(updateArticleVisibility, 100);
  
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get filter value from data-filter attribute or button text
      const filterValue = button.getAttribute('data-filter') || 
                         button.textContent.trim().toLowerCase();
      
      console.log('Filter clicked:', filterValue);
      
      // Toggle filter
      if (activeFilter === filterValue) {
        // Deactivate current filter
        console.log('Deactivating filter');
        activeFilter = null;
        filterButtons.forEach(btn => btn.classList.remove('active'));
      } else {
        // Activate new filter
        console.log('Activating filter:', filterValue);
        activeFilter = filterValue;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        console.log('Active class added. Button classes:', button.className);
      }
      
      debouncedUpdate();
    });
  });
}

// Clear all filters and search
export function clearAllFilters() {
  currentSearch = '';
  activeFilter = null;
  
  // Clear search input
  const searchInput = document.getElementById('articleSearch');
  const clearButton = document.getElementById('clearSearch');
  
  if (searchInput) searchInput.value = '';
  if (clearButton) clearButton.style.display = 'none';
  
  // Clear active filter buttons
  document.querySelectorAll('.filter-btn.active').forEach(btn => {
    btn.classList.remove('active');
  });
  
  updateArticleVisibility();
}

// Get current search and filter state
export function getSearchState() {
  return {
    search: currentSearch,
    filter: activeFilter
  };
}

// Set search programmatically
export function setSearch(searchTerm) {
  currentSearch = searchTerm || '';
  
  const searchInput = document.getElementById('articleSearch');
  const clearButton = document.getElementById('clearSearch');
  
  if (searchInput) searchInput.value = currentSearch;
  if (clearButton) {
    clearButton.style.display = currentSearch ? 'block' : 'none';
  }
  
  updateArticleVisibility();
}

// Main setup function
export function setupSearch() {
  console.log('Setting up search functionality...');
  
  // Initialize search and filter functionality
  setupSearchInput();
  setupFilters();
  
  // Run initial visibility update
  updateArticleVisibility();
  
  console.log('Search functionality initialized');
}