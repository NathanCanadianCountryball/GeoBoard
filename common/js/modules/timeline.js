import { timelineItems, toggleButtons, filterButtons } from './dom.js';

let activeFilter = null;

// ————————————————————————————————————————————
// 1. SCROLL-REVEAL for timeline items
// ————————————————————————————————————————————
function revealOnScroll() {
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
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".timeline-item");
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
}

// ————————————————————————————————————————————
// 3. FILTER BUTTONS
// ————————————————————————————————————————————
function setupFilters() {
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
}

// ————————————————————————————————————————————
// INITIALIZATION WRAPPER
// ————————————————————————————————————————————
export function setupTimelineFeatures() {
  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load", revealOnScroll);

  setupExpandableTimeline();
  setupFilters();
}
