export async function setupArticle() {
  console.log('✓ What Is a Country? article module loaded');
  try {
    const res = await fetch('/data/recognition-data.geojson');
    if (!res.ok) throw new Error('Failed to load GeoJSON: ' + res.status);
    const data = await res.json();
    initMap(data);
  } catch (err) {
    console.error('GeoJSON load error:', err);
  }
}

function initMap(RECOGNITION_DATA) {

// ── CHAPTER DATA ──
const chapters = [
  {
    label: "Chapter 1", eyebrow: "Chapter 1",
    title: "The Simplest Question With No Simple Answer",
    body: "There are 193 countries — or 195, or 197. The disagreement reflects one of the biggest tensions in international politics.",
    mapFocus: { center: [0, 20], zoom: 1.5 },
    highlight: []
  },
  {
    label: "Chapter 2", eyebrow: "Chapter 2",
    title: "The Birth of the State",
    body: "The modern state is a surprisingly recent invention. It took a century of European war to produce the first real blueprint.",
    mapFocus: { center: [10, 50], zoom: 3.5 },
    highlight: []
  },
  {
    label: "Chapter 3", eyebrow: "Chapter 3",
    title: "Montevideo",
    body: "In 1933, 20 nations tried to define statehood once and for all. Their four criteria are still the starting point — and still not enough.",
    mapFocus: { center: [-56, -34], zoom: 3.5 },
    highlight: []
  },
  {
    label: "Chapter 4", eyebrow: "Chapter 4",
    title: "Recognition: The Politics of Existence",
    body: "Recognition isn't just diplomatic courtesy — it's the difference between having a voice in the world and being invisible to it.",
    mapFocus: { center: [121, 24], zoom: 4.5 },
    highlight: []
  },
  {
    label: "Chapter 5", eyebrow: "Chapter 5",
    title: "The Edge Cases That Break Every Definition",
    body: "Vatican City has 800 people. Hong Kong has 7.5 million. Neither fits the standard template. The map is stranger than any atlas admits.",
    mapFocus: { center: [12.45, 41.90], zoom: 5 },
    highlight: []
  },
  {
    label: "Conclusion", eyebrow: "Conclusion",
    title: "Why It Matters",
    body: "How we define a country determines who gets a seat at the table — and whose citizens can travel freely.",
    mapFocus: { center: [0, 20], zoom: 1.5 },
    highlight: []
  }
];

// ── STATUS CONFIG ──
const statusColors = {
  full:         '#3b82f6',
  partial:      '#f59e0b',
  disputed:     '#ef4444',
  observer:     '#8b5cf6',
  unrecognized: '#9ca3af'
};

const statusLabels = {
  full:         'Fully Recognized',
  partial:      'Partially Recognized',
  disputed:     'Disputed Territory',
  observer:     'UN Observer',
  unrecognized: 'Unrecognized'
};

const iso3to2 = {
  USA:'us',GBR:'gb',FRA:'fr',DEU:'de',ITA:'it',ESP:'es',CHN:'cn',JPN:'jp',
  RUS:'ru',CAN:'ca',AUS:'au',BRA:'br',IND:'in',ZAF:'za',EGY:'eg',NGA:'ng',
  TWN:'tw',KOR:'kr',PRK:'kp',IRN:'ir',IRQ:'iq',ISR:'il',PSE:'ps',SYR:'sy',
  TUR:'tr',SAU:'sa',ARE:'ae',PAK:'pk',AFG:'af',UKR:'ua',POL:'pl',SWE:'se',
  NOR:'no',DNK:'dk',FIN:'fi',NLD:'nl',BEL:'be',CHE:'ch',AUT:'at',GRC:'gr',
  PRT:'pt',MEX:'mx',ARG:'ar',CHL:'cl',COL:'co',PER:'pe',VEN:'ve',NZL:'nz',
  IDN:'id',MYS:'my',THA:'th',VNM:'vn',PHL:'ph',SGP:'sg',MMR:'mm',BGD:'bd',
  NRU:'nr',VAT:'va',MCO:'mc',SMR:'sm',LIE:'li',KAZ:'kz',CUB:'cu',BHS:'bs',
  FSM:'fm',XKX:'xk'
};

// ── BUILD STATUS LOOKUP FROM GEOJSON ──
const statusByCode = {};
RECOGNITION_DATA.features.forEach(f => {
  const p = f.properties;
  if (p && p.ADM0_A3 && p.status) {
    statusByCode[p.ADM0_A3] = p.status;
  }
});

function getStatus(code) {
  return statusByCode[code] || 'full';
}

// ── INFOBOX ──
function showCountryInInfobox(name, code, status) {
  document.getElementById('infoboxChapter').style.display = 'none';
  document.getElementById('infoboxCountry').classList.add('visible');
  document.getElementById('infoboxCountryName').textContent = name;

  const badge = document.getElementById('infoboxStatusBadge');
  badge.className = `status-badge ${status}`;
  badge.textContent = `● ${statusLabels[status] || status}`;

  const iso2 = iso3to2[code] || '';
  const flagEl = document.getElementById('infoboxFlag');
  if (iso2) {
    flagEl.src = `https://flagcdn.com/w80/${iso2.toLowerCase()}.png`;
    flagEl.style.display = 'block';
  } else {
    flagEl.style.display = 'none';
  }

  document.getElementById('infoboxUN').textContent =
    status === 'full' ? 'Yes' : status === 'observer' ? 'Observer' : 'No';
  document.getElementById('infoboxRecognizedBy').textContent =
    status === 'full' ? '190+' : status === 'partial' ? '12–100' : '0–12';
  document.getElementById('infoboxCapital').textContent = '—';
}

function restoreChapterInfobox() {
  document.getElementById('infoboxChapter').style.display = '';
  document.getElementById('infoboxCountry').classList.remove('visible');
}

// ── MAP INIT ──
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [0, 20],
  zoom: 1.5,
  attributionControl: false
});

map.addControl(new maplibregl.AttributionControl({ compact: true }));

map.on('load', () => {
  map.addSource('world-countries', {
    type: 'vector',
    url: 'https://demotiles.maplibre.org/tiles/tiles.json'
  });

  map.addLayer({
    id: 'world-fills',
    type: 'fill',
    source: 'world-countries',
    'source-layer': 'countries',
    paint: {
      'fill-color': statusColors.full,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 0.45,
        0.12
      ]
    }
  });

  map.addLayer({
    id: 'world-borders',
    type: 'line',
    source: 'world-countries',
    'source-layer': 'countries',
    paint: {
      'line-color': '#93c5fd',
      'line-width': 0.7,
      'line-opacity': 0.5
    }
  });

  const dataWithIds = JSON.parse(JSON.stringify(RECOGNITION_DATA));
  dataWithIds.features.forEach((f, i) => { f.id = i; });

  map.addSource('recognition', {
    type: 'geojson',
    data: dataWithIds
  });

  map.addLayer({
    id: 'recognition-fills',
    type: 'fill',
    source: 'recognition',
    paint: {
      'fill-color': [
        'match', ['get', 'status'],
        'full',         statusColors.full,
        'partial',      statusColors.partial,
        'disputed',     statusColors.disputed,
        'observer',     statusColors.observer,
        'unrecognized', statusColors.unrecognized,
        statusColors.full
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 0.75,
        0.55
      ]
    }
  });

  map.addLayer({
    id: 'recognition-borders',
    type: 'line',
    source: 'recognition',
    paint: {
      'line-color': [
        'match', ['get', 'status'],
        'full',         statusColors.full,
        'partial',      statusColors.partial,
        'disputed',     statusColors.disputed,
        'observer',     statusColors.observer,
        'unrecognized', statusColors.unrecognized,
        statusColors.full
      ],
      'line-width': 1.5,
      'line-opacity': 0.8
    }
  });

  setupHover();
  setupSnapScroll();
  setupProgressBar();
  setupChapterNav();
});

// ── HOVER ──
function setupHover() {
  const tooltip    = document.getElementById('mapTooltip');
  const tooltipTxt = document.getElementById('tooltipText');
  const tooltipDot = document.getElementById('tooltipDot');
  let hoveredWorldId = null;
  let hoveredRecId   = null;

  map.on('mousemove', 'recognition-fills', (e) => {
    if (!e.features.length) return;
    map.getCanvas().style.cursor = 'pointer';

    if (hoveredRecId !== null) {
      map.setFeatureState({ source: 'recognition', id: hoveredRecId }, { hover: false });
    }
    hoveredRecId = e.features[0].id;
    map.setFeatureState({ source: 'recognition', id: hoveredRecId }, { hover: true });

    const p      = e.features[0].properties;
    const name   = p.name || 'Unknown';
    const code   = p.ADM0_A3 || '';
    const status = p.status  || 'full';

    tooltipDot.style.background = statusColors[status] || statusColors.full;
    tooltipTxt.textContent = `${name} · ${statusLabels[status] || status}`;
    tooltip.style.left = (e.point.x + 14) + 'px';
    tooltip.style.top  = (e.point.y - 10) + 'px';
    tooltip.classList.add('visible');

    showCountryInInfobox(name, code, status);
  });

  map.on('mouseleave', 'recognition-fills', () => {
    if (hoveredRecId !== null) {
      map.setFeatureState({ source: 'recognition', id: hoveredRecId }, { hover: false });
    }
    hoveredRecId = null;
  });

  map.on('mousemove', 'world-fills', (e) => {
    const recFeatures = map.queryRenderedFeatures(e.point, { layers: ['recognition-fills'] });
    if (recFeatures.length > 0) return;

    map.getCanvas().style.cursor = 'pointer';

    if (hoveredWorldId !== null) {
      map.setFeatureState(
        { source: 'world-countries', sourceLayer: 'countries', id: hoveredWorldId },
        { hover: false }
      );
    }
    hoveredWorldId = e.features[0].id;
    map.setFeatureState(
      { source: 'world-countries', sourceLayer: 'countries', id: hoveredWorldId },
      { hover: true }
    );

    const name   = e.features[0].properties.NAME || e.features[0].properties.name || 'Unknown';
    const code   = e.features[0].properties.ADM0_A3 || '';
    const status = getStatus(code);

    tooltipDot.style.background = statusColors[status];
    tooltipTxt.textContent = `${name} · ${statusLabels[status]}`;
    tooltip.style.left = (e.point.x + 14) + 'px';
    tooltip.style.top  = (e.point.y - 10) + 'px';
    tooltip.classList.add('visible');

    showCountryInInfobox(name, code, status);
  });

  map.on('mouseleave', 'world-fills', () => {
    map.getCanvas().style.cursor = '';
    if (hoveredWorldId !== null) {
      map.setFeatureState(
        { source: 'world-countries', sourceLayer: 'countries', id: hoveredWorldId },
        { hover: false }
      );
    }
    hoveredWorldId = null;
    tooltip.classList.remove('visible');
    restoreChapterInfobox();
  });
}

function setupSnapScroll() {
  // ── Config knobs ──
  const SNAP_THRESHOLD  = 110;  // px of overscroll to trigger a snap
  const COOLDOWN_MS     = 900;  // ms lockout after each snap
  const SMALL_THRESHOLD = 8;    // ignore wheel ticks smaller than this
  const SLIDE_MS        = 480;  // chapter slide animation duration

  // How long after the last wheel event before we treat the gesture
  // as "released". 150ms is short enough to feel instant, long enough
  // not to fire mid-trackpad-momentum.
  const RELEASE_WAIT_MS = 150;

  // ── State ──
  let currentIndex         = 0;
  let overscroll           = 0;
  let isAnimating          = false;
  let isOnCooldown         = false;
  let lastWheelTime        = 0;
  let hasScrolledInChapter = false;
  let releaseTimer         = null;  // setTimeout handle — cleared on each tick

  const outerEl    = document.getElementById('articleScroll');
  const chapterEls = Array.from(document.querySelectorAll('.chapter'));

  // ── Move .article-header inside chapter 0 ──
  const header   = outerEl.querySelector('.article-header');
  const chapter0 = chapterEls[0];
  if (header && chapter0) {
    chapter0.insertBefore(header, chapter0.firstChild);
  }

  // ── Make outer container a clipping viewport ──
  outerEl.style.overflow = 'hidden';
  outerEl.style.position = 'relative';

  // ── Style each chapter as its own full-height scrollable pane ──
  chapterEls.forEach((ch, i) => {
    ch.style.position  = 'absolute';
    ch.style.top       = '0';
    ch.style.left      = '0';
    ch.style.width     = '100%';
    ch.style.height    = '100%';
    ch.style.paddingBottom = '80px';
    ch.style.overflowY = 'auto';
    ch.style.overflowX = 'hidden';
    ch.style.boxSizing = 'border-box';
    ch.style.transform  = i === 0 ? 'translateY(0%)' : 'translateY(100%)';
    ch.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    ch.style.willChange = 'transform';
  });

  // ── Build arrow + gradient overlay ──
  // The overlay is a separate div that lives inside #articleScroll.
  // It sits above the chapter content using z-index, and moves with
  // the chapter during the slide animation by sharing the same
  // translateY transform (applied in sync in activateChapter).
  const overlayEl = document.createElement('div');
  overlayEl.id = 'snapOverlay';

  // The arrow container inside the overlay
  const arrowEl = document.createElement('div');
  arrowEl.id = 'snapArrow';
  arrowEl.innerHTML = `
    <svg class="snap-chevron" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="2,2 12,12 22,2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="snap-chevron" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="2,2 12,12 22,2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="snap-chevron" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="2,2 12,12 22,2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  overlayEl.appendChild(arrowEl);
  outerEl.appendChild(overlayEl);

  const chevrons = Array.from(arrowEl.querySelectorAll('.snap-chevron'));

  function updateArrow(progress, direction, chEl) {
    const isUp = direction < 0;

    if (progress <= 0) {
      // Hide everything and reset chapter nudge
      overlayEl.style.opacity   = '0';
      overlayEl.style.transform = isUp
        ? 'translateY(-100%)'   // reset to off top
        : 'translateY(100%)';   // reset to off bottom
      if (chEl) chEl.style.transform = 'translateY(0%)';
      return;
    }

    // ── FIX 1: Slide overlay in from off-screen as progress builds ──
    // At progress=0: overlay is translateY(100%) — fully below the pane.
    // At progress=1: overlay is translateY(0%)   — fully visible.
    const slideIn = isUp
      ? `translateY(${-100 + progress * 100}%)`  // slides down from top
      : `translateY(${100 - progress * 100}%)`;  // slides up from bottom

    overlayEl.style.transform = slideIn;
    overlayEl.style.opacity   = String(Math.min(progress * 1.6, 1));
    overlayEl.classList.toggle('overlay-up', isUp);

    // ── FIX 4: Nudge the chapter content upward as overscroll builds ──
    // Max nudge is 32px. We use the chapter's current translateY base (0%)
    // plus a small pixel offset so text drifts up as the overlay comes in.
    const nudgePx = progress * 32;
    if (chEl) {
      // Preserve the chapter's base translateY(0%) and add the nudge on top
      chEl.style.transform = isUp
        ? `translateY(${nudgePx}px)`   // nudge down when going to prev
        : `translateY(${-nudgePx}px)`; // nudge up when going to next
    }

    // ── Chevron spread ──
    const spread = progress * 8;
    chevrons[0].style.transform = `translateY(${isUp ?  spread : -spread}px)`;
    chevrons[1].style.transform = `translateY(0px)`;
    chevrons[2].style.transform = `translateY(${isUp ? -spread :  spread}px)`;
  }

  // ── hideOverlay ──
  // Fades the overlay and chevrons out in place, and springs the chapter
  // text back to its resting position. Called when the user releases
  // without reaching the snap threshold.
  function hideOverlay(chEl) {
    overlayEl.style.transition = 'opacity 220ms ease';
    overlayEl.style.opacity    = '0';

    if (chEl) {
      chEl.style.transition = 'transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      chEl.style.transform  = 'translateY(0%)';
    }
  }

  // ── Wheel listener on each chapter ──
  chapterEls.forEach((chEl, i) => {
    chEl.addEventListener('wheel', (event) => {
      const delta = event.deltaY;

      if (Math.abs(delta) < SMALL_THRESHOLD) return;
      if (isAnimating || isOnCooldown) return;

      // Clear any pending release timer — the user is still scrolling
      if (releaseTimer) {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }

      // Decay overscroll if the user paused
      const now = Date.now();
      if (now - lastWheelTime > 350) overscroll = 0;
      lastWheelTime = now;

      const scrollingDown = delta > 0;
      const scrollingUp   = delta < 0;
      const atBottom = chEl.scrollTop + chEl.clientHeight >= chEl.scrollHeight - 2;
      const atTop    = chEl.scrollTop <= 0;

      if (scrollingDown && atBottom) {
        if (i >= chapterEls.length - 1) return;

        const chapterHasOverflow = chEl.scrollHeight > chEl.clientHeight + 2;
        if (chapterHasOverflow && !hasScrolledInChapter) {
          event.preventDefault();
          return;
        }

        overscroll += delta;
        event.preventDefault();

      } else if (scrollingUp && atTop) {
        if (i <= 0) return;
        overscroll += delta;
        event.preventDefault();

      } else {
        // Normal in-chapter scroll — reset overscroll and hide any overlay
        overscroll = 0;
        hasScrolledInChapter = true;
        updateArrow(0, 1, chEl);
        return;
      }

      const direction = scrollingDown ? 1 : -1;
      // Cap overscroll at threshold so it doesn't grow unboundedly
      overscroll = Math.sign(overscroll) * Math.min(Math.abs(overscroll), SNAP_THRESHOLD);
      const progress = Math.abs(overscroll) / SNAP_THRESHOLD;
      updateArrow(progress, direction, chEl);

      // ── Schedule a release check ──
      // Every wheel tick resets this timer. When the wheel finally goes quiet
      // for RELEASE_WAIT_MS, the callback runs and decides: snap or return.
      releaseTimer = setTimeout(() => {
        releaseTimer = null;
        const didSnap = Math.abs(overscroll) >= SNAP_THRESHOLD;
        overscroll = 0;

        if (didSnap) {
          // ── Snap ──
          const nextIndex = currentIndex + direction;
          if (nextIndex < 0 || nextIndex >= chapterEls.length) {
            hideOverlay(chEl);
            return;
          }

          // Slide chapter out
          chEl.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          chEl.style.transform  = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';

          // Fade overlay out in place
          overlayEl.style.transition = 'opacity 180ms ease';
          overlayEl.style.opacity    = '0';

          activateChapter(nextIndex, direction);

          isAnimating  = true;
          isOnCooldown = true;
          setTimeout(() => { isAnimating  = false; }, SLIDE_MS);
          setTimeout(() => { isOnCooldown = false; }, COOLDOWN_MS);

        } else {
          // ── Not enough force — return everything to rest ──
          hideOverlay(chEl);
        }

      }, RELEASE_WAIT_MS);

    }, { passive: false });
  });

  // Activate chapter 0 on load
  activateChapter(0, 1);

  // ── ACTIVATE CHAPTER ──
  function activateChapter(index, direction) {
    const prevIndex = currentIndex;
    currentIndex    = index;
    const ch        = chapters[index];

    const outgoing = chapterEls[prevIndex];
    const incoming = chapterEls[index];

    // FIX 3: Reset the scroll-intent guard for the new chapter.
    // Short chapters (no overflow) don't need the guard — treat as already scrolled.
    hasScrolledInChapter = false;

    // Slide outgoing chapter out (only if not first load)
    if (outgoing && prevIndex !== index) {
      outgoing.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      outgoing.style.transform  = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
    }

    // Reset overlay to off-screen starting position for the incoming direction,
    // with no transition so it snaps instantly before the next overscroll
    overlayEl.style.transition = 'none';
    overlayEl.style.opacity    = '0';
    overlayEl.style.transform  = direction > 0 ? 'translateY(100%)' : 'translateY(-100%)';

    // Snap incoming to its off-screen starting position (no transition)
    incoming.style.transition = 'none';
    incoming.style.transform  = direction > 0 ? 'translateY(100%)' : 'translateY(-100%)';
    incoming.scrollTop        = 0;

    // Two rAF frames: let browser commit the starting position, then animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        incoming.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        incoming.style.transform  = 'translateY(0%)';
      });
    });

    // ── Update infobox ──
    document.getElementById('infoboxEyebrow').textContent = ch.eyebrow;
    document.getElementById('infoboxTitle').textContent   = ch.title;
    document.getElementById('infoboxBody').textContent    = ch.body;

    // ── Update chapter badge ──
    document.getElementById('chapterBadge').textContent = ch.label;

    // ── Update nav dots ──
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // ── Update active chapter highlight ──
    chapterEls.forEach((section, i) => {
      section.classList.toggle('active', i === index);
    });

    // ── Fly the map ──
    map.flyTo({
      center:   ch.mapFocus.center,
      zoom:     ch.mapFocus.zoom,
      duration: 1200,
      essential: true
    });
  }

  // Expose activateChapter for nav dots
  outerEl._activateChapter = activateChapter;
}


function setupChapterNav() {
  const navEl  = document.getElementById('chapterNav');
  const outerEl = document.getElementById('articleScroll');

  chapters.forEach((ch, i) => {
    const dot = document.createElement('div');
    dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
    dot.innerHTML = `<span class="nav-dot-label">${ch.label}</span>`;

    dot.addEventListener('click', () => {
      if (outerEl._activateChapter) {
        // Infer direction from current active dot
        const currentActive = navEl.querySelectorAll('.nav-dot');
        let currentIndex = 0;
        currentActive.forEach((d, idx) => { if (d.classList.contains('active')) currentIndex = idx; });
        const direction = i >= currentIndex ? 1 : -1;
        outerEl._activateChapter(i, direction);
      }
    });

    navEl.appendChild(dot);
  });
}

function setupProgressBar() {
  const scrollEl   = document.getElementById('articleScroll');
  const progressEl = document.getElementById('progressBar');
  scrollEl.addEventListener('scroll', () => {
    const pct = (scrollEl.scrollTop / (scrollEl.scrollHeight - scrollEl.clientHeight)) * 100;
    progressEl.style.width = pct + '%';
  });
}

}