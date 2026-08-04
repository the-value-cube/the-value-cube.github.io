/* ============================================================================
   analytics.js — Google Analytics 4 for the-value-cube.github.io
   ----------------------------------------------------------------------------
   Self-contained. Loaded on every page; it attaches its own listeners and never
   reaches into the page scripts, so cube.html / score.html / tradeoffs.html can
   be edited freely without breaking measurement.

   ┌─ EDIT ME ────────────────────────────────────────────────────────────────┐
   │ 1. Create a GA4 property at https://analytics.google.com with your Gmail │
   │    (Admin → Create → Property → Web data stream → the-value-cube.github.io)│
   │ 2. Copy the Measurement ID it gives you — it looks like G-ABCD1234XY      │
   │ 3. Paste it into GA_MEASUREMENT_ID below, then run ./publish.sh           │
   └──────────────────────────────────────────────────────────────────────────┘
   Until a real ID is pasted in, this file loads nothing and does nothing —
   the site keeps working exactly as it does today.
   ========================================================================== */

const GA_MEASUREMENT_ID = 'G-8HRCH0QG8S';   // the-value-cube.github.io web stream

/* Cookieless mode. true  = no cookies, no consent banner needed, but returning
                            visitors can't be told apart, so "users" is modelled.
                     false = standard GA4 with cookies and accurate user counts,
                            which in the UK/EU obliges you to ask consent first.
   See README → "Analytics" before flipping this. */
const COOKIELESS = true;

/* ------------------------------------------------------------------------- */

(function () {
  'use strict';

  if (!/^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID) || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

  /* --- don't measure the author -------------------------------------------
     Local previews never count. And opening the live site once with
     ?tvc-optout=1 silences this browser permanently (?tvc-optout=0 undoes it),
     so your own visits don't drown out a real reader's on a quiet week. */
  const host = location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return;

  const params = new URLSearchParams(location.search);
  if (params.has('tvc-optout')) {
    try {
      if (params.get('tvc-optout') === '0') localStorage.removeItem('tvc-optout');
      else localStorage.setItem('tvc-optout', '1');
    } catch (e) { /* storage blocked — fall through */ }
  }
  try { if (localStorage.getItem('tvc-optout') === '1') return; } catch (e) { /* ignore */ }

  /* --- load gtag ---------------------------------------------------------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  if (COOKIELESS) {
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
  }

  const cfg = {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  };
  if (COOKIELESS) cfg.client_storage = 'none';

  /* QR codes and printed labels carry ?src=… instead of a full UTM string,
     because a short URL makes a smaller, more scannable QR. Translate it into
     campaign fields so scans land in Acquisition alongside everything else.
     Only when the visit has no UTMs of its own — never overwrite a real one. */
  const src = params.get('src');
  if (src && !params.has('utm_source')) {
    cfg.campaign_source = src;
    cfg.campaign_medium = params.get('medium') || 'qr';
    cfg.campaign_name = 'offline-' + src;
  }

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, cfg);

  const track = (name, props) => gtag('event', name, props || {});

  /* Which page are we on? Each include declares itself:
       <script src="assets/analytics.js" data-page="cube" defer></script>
     This matters for 404.html above all — GitHub Pages serves it at whatever
     path the visitor mistyped, so the URL can't be used to recognise it. */
  const me = document.currentScript;
  const page = (me && me.dataset.page)
    || (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '')
    || 'index';

  /* ======================================================================
     1. Outbound clicks — the conversion step.
     Every retail link and the toolkit mailto, wherever they are rendered.
     ====================================================================== */
  const STORE_BY_HOST = {
    'notionpress.com': 'Notion Press',
    'www.notionpress.com': 'Notion Press',
    'www.amazon.in': 'Amazon.in',
    'amazon.in': 'Amazon.in',
    'www.amazon.com': 'Amazon.com',
    'amazon.com': 'Amazon.com',
    'www.amazon.co.uk': 'Amazon.co.uk',
    'amazon.co.uk': 'Amazon.co.uk'
  };

  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';

    if (href.startsWith('mailto:')) {
      track('toolkit_request', { source_page: page });
      return;
    }

    let url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (!/^https?:$/.test(url.protocol) || url.hostname === location.hostname) return;

    const label = (a.textContent || '').trim().slice(0, 90);
    track('outbound_click', {
      link_domain: url.hostname,
      link_url: url.href,
      link_text: label,
      source_page: page
    });

    const store = STORE_BY_HOST[url.hostname];
    if (store) track('buy_click', { store: store, link_url: url.href, source_page: page });
  }, true);

  /* ======================================================================
     2. Cube navigation.
     cube.html moves through faces, cubelets and dimensions with
     history.replaceState, which deliberately fires no hashchange event —
     so wrap it rather than edit the cube's own code.
     ====================================================================== */
  if (page === 'cube') {
    let last = null;
    const seen = () => {
      const h = (location.hash || '').replace(/^#/, '').toLowerCase();
      if (!h || h === last) return;
      last = h;
      const kind = /^face-\d+-\d+$/.test(h) ? 'cubelet'
        : /^face-\d+$/.test(h) ? 'face'
        : /^dim-/.test(h) ? 'dimension'
        : h === 'all-54' ? 'all-54'
        : h === 'dimensions' ? 'dimensions'
        : h === 'book' ? 'book'
        : 'other';
      track('cube_view', { cube_view_id: h, cube_view_kind: kind });
    };
    const wrap = (fn) => function () { const r = fn.apply(history, arguments); seen(); return r; };
    history.replaceState = wrap(history.replaceState);
    history.pushState = wrap(history.pushState);
    addEventListener('hashchange', seen);
    seen();
  }

  /* ======================================================================
     3. Cube Score calculator.
     "Did they actually score something, and did they pass it on?" —
     the share and copy actions are the ones that mean the tool travelled.
     ====================================================================== */
  if (page === 'score') {
    let started = false;
    document.addEventListener('change', function (e) {
      if (!e.target.closest || !e.target.closest('#faces, #dims')) return;
      if (started) return;
      started = true;
      track('score_started', {});
    }, true);

    const BUTTONS = { example: 'score_example', share: 'score_share', copy: 'score_copy', print: 'score_print' };
    document.addEventListener('click', function (e) {
      const b = e.target.closest && e.target.closest('button[id]');
      if (b && BUTTONS[b.id]) track(BUTTONS[b.id], {});
    }, true);

    /* Someone arriving on a shared link is a distinct, valuable signal:
       it means a reader sent their scores to a colleague and the colleague came. */
    if ((location.hash || '').length > 1) track('score_shared_link_opened', {});
  }

  /* ======================================================================
     4. Trade-offs matrix — which face pairs people actually probe.
     ====================================================================== */
  if (page === 'tradeoffs') {
    document.addEventListener('click', function (e) {
      const cell = e.target.closest && e.target.closest('.cell[data-r][data-c]');
      if (!cell) return;
      track('tradeoff_cell', { face_pair: cell.dataset.r + '→' + cell.dataset.c });
    }, true);
  }

  /* ======================================================================
     5. Not-found pages — catches a mistyped link in a post, a reel end card
        or a printed label, which is exactly where a typo is expensive.
     ====================================================================== */
  if (page === '404') {
    track('page_not_found', {
      not_found_path: location.pathname + location.search,
      not_found_referrer: document.referrer || '(none)'
    });
  }
})();
