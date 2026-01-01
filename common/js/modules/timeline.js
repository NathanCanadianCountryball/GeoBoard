import { timelineItems, toggleButtons } from './dom.js';

let activeFilter = null;

console.log("=== TIMELINE.JS LOADED ===");
console.log("timelineItems:", timelineItems);
console.log("toggleButtons:", toggleButtons);

// ————————————————————————————————————————————
// 1. SCROLL-REVEAL for timeline items
// ————————————————————————————————————————————
function revealOnScroll() {
  if (!timelineItems || timelineItems.length === 0) {
    console.warn("No timeline items found for scroll reveal");
    return;
  }
  
  timelineItems.forEach(item => {
    if (item.getBoundingClientRect().top < window.innerHeight - 100) {
      item.classList.add("visible");
    }
  });
}

// ————————————————————————————————————————————
// 2. EXPANDABLE TIMELINE ITEMS
// ————————————————————————————————————————————
function setupExpandableTimeline() {
  console.log("=== SETTING UP EXPANDABLE TIMELINE ===");
  
  if (!toggleButtons || toggleButtons.length === 0) {
    console.warn("No toggle buttons found!");
    return;
  }
  
  console.log(`Found ${toggleButtons.length} toggle buttons`);
  
  toggleButtons.forEach((btn, index) => {
    console.log(`Setting up toggle button ${index}:`, btn);
    
    btn.addEventListener("click", () => {
      console.log(`Toggle button ${index} clicked`);
      
      const item = btn.closest(".timeline-item");
      if (!item) {
        console.error("Could not find parent .timeline-item");
        return;
      }
      
      const currently = item.classList.contains("active");
      console.log(`Timeline item currently active: ${currently}`);

      document.querySelectorAll(".timeline-item.active").forEach(i => {
        i.classList.remove("active");
        const toggleBtn = i.querySelector(".toggle-btn");
        if (toggleBtn) toggleBtn.textContent = "+";
      });

      if (!currently) {
        item.classList.add("active");
        btn.textContent = "−";
        console.log("Timeline item expanded");
      } else {
        console.log("Timeline item collapsed");
      }
    });
  });
  
  console.log("=== Expandable timeline setup complete ===");
}

// ————————————————————————————————————————————
// INITIALIZATION WRAPPER
// ————————————————————————————————————————————
export function setupTimelineFeatures() {
  console.log("=== SETUP TIMELINE FEATURES CALLED ===");
  
  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load", revealOnScroll);
  
  console.log("Scroll and load listeners attached");

  setupExpandableTimeline();
  
  // Note: setupFilters() removed - it was causing an error
  // Timeline pages should handle their own filtering if needed
  
  console.log("=== Timeline features initialization complete ===");
}