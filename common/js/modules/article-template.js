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
  
  // Attach directly to window so HTML onclick properties can access them
  window.advanceFlow = function(step, isYes) {
    const card1 = document.getElementById('card-step1');
    const card2 = document.getElementById('card-step2');
    const card3 = document.getElementById('card-step3');
    const resultCard = document.getElementById('card-result');
    
    const connect1 = document.getElementById('connect-1');
    const connect2 = document.getElementById('connect-2');
    const connect3 = document.getElementById('connect-3');

    const resultTitle = document.getElementById('result-title');
    const resultBody = document.getElementById('result-body');

    if (!isYes) {
      resultCard.classList.remove('hidden');
      resultTitle.textContent = "Statehood Denied";
      resultBody.textContent = "Darn it! Under Section 1 of the Montevideo Convention, missing any single core pillar immediately invalidates your claim to statehood.";
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (step === 'step1') {
      card1.classList.add('passed');
      connect1.classList.add('active');
      card2.classList.remove('locked');
    } else if (step === 'step2') {
      card2.classList.add('passed');
      connect2.classList.add('active');
      card3.classList.remove('locked');
    } else if (step === 'step3') {
      card3.classList.add('passed');
      connect3.classList.add('active');
      
      resultCard.classList.remove('hidden');
      resultTitle.textContent = "Accepted But Not Guaranteed";
      resultBody.textContent = "Congrats! Technically, your entity satisfies all legal conditions for statehood! According to the Declaratory Theory, it's fully a country. Simple enough — until you realize most breakaway regions satisfy all four criteria. Scroll down to Chapter 4 to find out why a region can check all these boxes and still remain invisible in the eyes of the UN.";
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  window.resetFlow = function() {
    const cards = ['card-step1', 'card-step2', 'card-step3'];
    cards.forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('passed');
      if(id !== 'card-step1') el.classList.add('locked');
    });

    document.querySelectorAll('.flow-connector').forEach(c => c.classList.remove('active'));
    document.getElementById('card-result').classList.add('hidden');
  };
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
    body: "The state is a surprisingly recent invention. It took a century of European war to produce some resemblance to a modern country.",
    mapFocus: { center: [10, 50], zoom: 3.5 },
    highlight: []
  },
  {
    label: "Chapter 3", eyebrow: "Chapter 3",
    title: "Montevideo",
    body: "In 1933, 20 nations tried to define statehood once and for all. Their four criteria became the international rulebook—but rules are made to be broken.",
    mapFocus: { center: [-56, -34], zoom: 3.5 },
    highlight: []
  },
  {
    label: "Chapter 4", eyebrow: "Chapter 4",
    title: "Recognition: The Politics of Existence",
    body: "All countries want to take a seat at the UN table. But there are countries who are just as determined as they are to wipe their name off the map.",
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
    body: "The question of what constitutes a country is essentially a power play. The answer forces you to pick a side in politics, interests and stakes that are higher than you think.",
    mapFocus: { center: [0, 20], zoom: 1.5 },
    highlight: []
  },
  {
    label: "Bibliography", eyebrow: "Sources",
    title: "Bibliography",
    body: "Eight primary sources underpin this article — from the Montevideo Convention to UN membership records and recent analyses of Taiwan's diplomatic standing. Click on the links to be reidrected to them.",
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
  // ── Config knobs (tuned for a softer social-media feel) ──
  const SNAP_THRESHOLD  = 95;   // slightly easier to trigger
  const COOLDOWN_MS     = 750;  // shorter lockout feels snappier
  const SMALL_THRESHOLD = 6;
  const SLIDE_MS        = 520;  // a touch longer = smoother
  const RELEASE_WAIT_MS = 120;  // faster decision after finger lifts

  // Easing used for chapter slides
  const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'; // iOS-like

  // ── State ──
  let currentIndex         = 0;
  let overscroll           = 0;
  let isAnimating          = false;
  let isOnCooldown         = false;
  let lastWheelTime        = 0;
  let hasScrolledInChapter = false;
  let releaseTimer         = null;

  const outerEl    = document.getElementById('articleScroll');
  const chapterEls = Array.from(document.querySelectorAll('.chapter'));

  // Move .article-header inside chapter 0
  const header   = outerEl.querySelector('.article-header');
  const chapter0 = chapterEls[0];
  if (header && chapter0) {
    chapter0.insertBefore(header, chapter0.firstChild);
  }

  outerEl.style.overflow = 'hidden';
  outerEl.style.position = 'relative';

  chapterEls.forEach((ch, i) => {
    ch.style.position      = 'absolute';
    ch.style.top           = '0';
    ch.style.left          = '0';
    ch.style.width         = '100%';
    ch.style.height        = '100%';
    ch.style.paddingBottom = '80px';
    ch.style.overflowY     = 'auto';
    ch.style.overflowX     = 'hidden';
    ch.style.boxSizing     = 'border-box';
    ch.style.transform     = i === 0 ? 'translateY(0%)' : 'translateY(100%)';
    ch.style.transition    = `transform ${SLIDE_MS}ms ${EASE}`;
    ch.style.willChange    = 'transform';
    ch.style.opacity       = i === 0 ? '1' : '0';
  });

  // Overlay
  const overlayEl = document.createElement('div');
  overlayEl.id = 'snapOverlay';

  const arrowEl = document.createElement('div');
  arrowEl.id = 'snapArrow';
  arrowEl.innerHTML = `
  <svg class="snap-chevron" viewBox="0 0 24 14" fill="none">
    <polyline points="2,2 12,12 22,2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg class="snap-chevron" viewBox="0 0 24 14" fill="none">
    <polyline points="2,2 12,12 22,2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg class="snap-chevron" viewBox="0 0 24 14" fill="none">
    <polyline points="2,2 12,12 22,2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span id="snapNextLabel">Next chapter</span>
  `;
  overlayEl.appendChild(arrowEl);
  outerEl.appendChild(overlayEl);

  const chevrons = Array.from(arrowEl.querySelectorAll('.snap-chevron'));
    const nextLabel = document.getElementById('snapNextLabel');

    function updateArrow(progress, direction, chEl) {
    const isUp = direction < 0;

    if (progress <= 0) {
      overlayEl.style.opacity   = '0';
      overlayEl.style.transform = isUp ? 'translateY(-12px)' : 'translateY(12px)';
      if (chEl) chEl.style.transform = 'translateY(0%)';
      if (nextLabel) nextLabel.style.opacity = '0';
      return;
    }

    const rise = isUp ? -12 + progress * 12 : 12 - progress * 12;
    overlayEl.style.transform = `translateY(${rise}px)`;
    overlayEl.style.opacity   = String(Math.min(progress * 1.4, 1));
    overlayEl.classList.toggle('overlay-up', isUp);

    const nudgePx = progress * 18;
    if (chEl) {
      chEl.style.transform = isUp
        ? `translateY(${nudgePx}px)`
        : `translateY(${-nudgePx}px)`;
    }

    const spread = progress * 6;
    chevrons.forEach((c, i) => {
      const offset = i === 0 ? (isUp ? spread : -spread)
                  : i === 2 ? (isUp ? -spread :  spread)
                  : 0;
      c.style.transform = `translateY(${offset}px) rotate(${isUp ? 180 : 0}deg)`;
      c.style.opacity = String(0.45 + progress * 0.55 - i * 0.08);
    });

    if (nextLabel) {
      nextLabel.textContent = isUp ? 'Previous chapter' : 'Next chapter';
      nextLabel.style.opacity = String(Math.min(progress * 1.8, 1));
    }
  }

  function hideOverlay(chEl) {
    overlayEl.style.transition = 'opacity 200ms ease, transform 220ms ease';
    overlayEl.style.opacity    = '0';
    overlayEl.style.transform  = 'translateY(8px)';

    if (chEl) {
      chEl.style.transition = `transform 280ms ${EASE}`;
      chEl.style.transform  = 'translateY(0%)';
    }
  }

    chapterEls.forEach((chEl, i) => {
    chEl.addEventListener('wheel', (event) => {
      const delta = event.deltaY;
      if (Math.abs(delta) < SMALL_THRESHOLD) return;
      if (isAnimating) return;

      if (releaseTimer) {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }

      const now = Date.now();
      if (now - lastWheelTime > 320) overscroll = 0;
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
        if (overscroll !== 0) {
          overscroll = 0;
          updateArrow(0, 1, chEl);
        }
        hasScrolledInChapter = true;
        return;
      }

      if (Math.abs(overscroll) > SNAP_THRESHOLD) {
        overscroll = Math.sign(overscroll) * SNAP_THRESHOLD;
      }

      if (overscroll === 0 || Math.abs(overscroll) < SMALL_THRESHOLD) {
        overscroll = 0;
        updateArrow(0, 1, chEl);
        return;
      }

      const direction = overscroll > 0 ? 1 : -1;
      const progress  = Math.abs(overscroll) / SNAP_THRESHOLD;
      updateArrow(progress, direction, chEl);

      releaseTimer = setTimeout(() => {
        releaseTimer = null;
        const didSnap = Math.abs(overscroll) >= SNAP_THRESHOLD * 0.92;
        const snapDir = overscroll > 0 ? 1 : -1;
        overscroll = 0;

        if (didSnap && !isOnCooldown) {
          const nextIndex = currentIndex + snapDir;
          if (nextIndex < 0 || nextIndex >= chapterEls.length) {
            hideOverlay(chEl);
            return;
          }

          chEl.style.transition = `transform ${SLIDE_MS}ms ${EASE}, opacity ${SLIDE_MS * 0.7}ms ease`;
          chEl.style.transform  = snapDir > 0 ? 'translateY(-100%)' : 'translateY(100%)';
          chEl.style.opacity    = '0';

          overlayEl.style.transition = 'opacity 160ms ease';
          overlayEl.style.opacity    = '0';

          activateChapter(nextIndex, snapDir);

          isAnimating  = true;
          isOnCooldown = true;
          setTimeout(() => { isAnimating  = false; }, SLIDE_MS);
          setTimeout(() => { isOnCooldown = false; }, COOLDOWN_MS);
        } else {
          hideOverlay(chEl);
        }
      }, RELEASE_WAIT_MS);
    }, { passive: false });
  });

  activateChapter(0, 1);

  function activateChapter(index, direction) {
    const prevIndex = currentIndex;
    currentIndex    = index;
    const ch        = chapters[index];

    const outgoing = chapterEls[prevIndex];
    const incoming = chapterEls[index];

    hasScrolledInChapter = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (incoming.scrollHeight > incoming.clientHeight + 4) {
          hasScrolledInChapter = true;
        }
      });
    });

    if (outgoing && prevIndex !== index) {
      outgoing.style.transition = `transform ${SLIDE_MS}ms ${EASE}, opacity ${SLIDE_MS * 0.65}ms ease`;
      outgoing.style.transform  = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
      outgoing.style.opacity    = '0';
    }

    // Reset overlay
    overlayEl.style.transition = 'none';
    overlayEl.style.opacity    = '0';
    overlayEl.style.transform  = 'translateY(8px)';

    // Position incoming off-screen, then animate in
    incoming.style.transition = 'none';
    incoming.style.transform  = direction > 0 ? 'translateY(100%)' : 'translateY(-100%)';
    incoming.style.opacity    = '0';
    incoming.scrollTop        = 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        incoming.style.transition = `transform ${SLIDE_MS}ms ${EASE}, opacity ${SLIDE_MS * 0.7}ms ease`;
        incoming.style.transform  = 'translateY(0%)';
        incoming.style.opacity    = '1';
      });
    });

    // Infobox + badge + nav
    document.getElementById('infoboxEyebrow').textContent = ch.eyebrow;
    document.getElementById('infoboxTitle').textContent   = ch.title;
    document.getElementById('infoboxBody').textContent    = ch.body;
    document.getElementById('chapterBadge').textContent   = ch.label;

    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    chapterEls.forEach((section, i) => {
      section.classList.toggle('active', i === index);
    });

    // Progress bar by chapter index
    const progressEl = document.getElementById('progressBar');
    if (progressEl) {
      progressEl.style.width = ((index + 1) / chapters.length * 100) + '%';
    }

    map.flyTo({
      center:   ch.mapFocus.center,
      zoom:     ch.mapFocus.zoom,
      duration: 1100,
      essential: true
    });
  }

  outerEl._activateChapter = activateChapter;

  // Footnote navigation (unchanged logic, just keep it)
  const bibIndex  = chapterEls.length - 1;
  const bibEl     = chapterEls[bibIndex];
  let fnOriginIndex = 0;

  document.querySelectorAll('a.fn-ref').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      fnOriginIndex = currentIndex;
      const direction = bibIndex > currentIndex ? 1 : -1;
      activateChapter(bibIndex, direction);
      setTimeout(() => {
        const targetEl = bibEl.querySelector('#' + targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('fn-highlight');
          setTimeout(() => targetEl.classList.remove('fn-highlight'), 1200);
        }
      }, SLIDE_MS + 40);
    });
  });

  document.querySelectorAll('a.fn-back').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const returnIndex = fnOriginIndex;
      activateChapter(returnIndex, returnIndex < bibIndex ? -1 : 1);
      setTimeout(() => {
        const originChEl = chapterEls[returnIndex];
        const anchorEl   = originChEl.querySelector('#' + targetId);
        if (anchorEl) {
          anchorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, SLIDE_MS + 40);
    });
  });
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

