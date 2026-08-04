/* ============================================================================
   promo.js — the launch-offer strip
   ----------------------------------------------------------------------------
   Injects one sticky line above the header on every page. Self-contained: its
   own markup, styles and behaviour live here, so the offer is edited or removed
   in ONE place rather than in five HTML files.

   ┌─ EDIT ME ────────────────────────────────────────────────────────────────┐
   │ Change the offer below. To take the strip down entirely, either set       │
   │ ENDS to a past date, or delete the <script src="assets/promo.js"> line    │
   │ from the five pages. Nothing else references this file.                   │
   └──────────────────────────────────────────────────────────────────────────┘
   ========================================================================== */

const PROMO = {
  label: 'Inaugural offer',
  text:  '40% off the book on Notion Press',
  /* Phones get the short line. The nav below already carries a "Get the book"
     button, so the strip only has to deliver the number and the code — letting
     it wrap to two rows on top of a two-row nav pushes the hero off screen. */
  textShort: '40% off on Notion Press',
  code:  'FIRSTREAD',
  cta:   'Get the book',
  url:   'https://notionpress.com/in/read/the-value-cube/',

  /* Optional end date, 'YYYY-MM-DD'. The strip hides itself from this date on,
     so an expired offer can't sit live on the site after you've forgotten it.
     null = runs until you remove it by hand. */
  ends: null
};

/* ------------------------------------------------------------------------- */

(function () {
  'use strict';

  if (PROMO.ends) {
    /* Compare as plain dates so it flips at local midnight, not at UTC. */
    const end = new Date(PROMO.ends + 'T23:59:59');
    if (!isNaN(end) && Date.now() > end.getTime()) return;
  }

  const css = `
  .tvc-promo{position:sticky; top:0; z-index:60; background:#E60027; color:#fff;
    font-family:'Manrope',ui-sans-serif,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;
    overflow:hidden;}
  .tvc-promo::after{content:""; position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%);
    transform:translateX(-100%); animation:tvcSheen 6.5s ease-in-out 1.5s infinite;}
  @keyframes tvcSheen{ 0%{transform:translateX(-100%);} 55%,100%{transform:translateX(100%);} }
  .tvc-promo-in{max-width:1060px; margin:0 auto; padding:9px 24px; display:flex;
    align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; position:relative; z-index:1;}
  .tvc-promo-lab{font-size:11px; font-weight:800; letter-spacing:.16em; text-transform:uppercase;
    background:rgba(255,255,255,.18); padding:4px 9px; border-radius:5px; white-space:nowrap;}
  .tvc-promo-txt{font-size:14.5px; font-weight:600;}
  .tvc-promo-code{font-family:inherit; cursor:pointer; background:#fff; color:#E60027;
    border:0; border-radius:6px; padding:5px 11px; font-size:13.5px; font-weight:800;
    letter-spacing:.06em; display:inline-flex; align-items:center; gap:7px; white-space:nowrap;}
  .tvc-promo-code em{font-style:normal; font-weight:700; font-size:11px; letter-spacing:.04em;
    color:#8a8a92; text-transform:uppercase;}
  .tvc-promo-code:hover{box-shadow:0 3px 12px rgba(0,0,0,.22);}
  .tvc-promo-code.done{background:#0b7a3b; color:#fff;} .tvc-promo-code.done em{color:rgba(255,255,255,.75);}
  .tvc-promo-cta{color:#fff; font-size:14px; font-weight:800; text-decoration:none;
    border-bottom:2px solid rgba(255,255,255,.55); padding-bottom:1px; white-space:nowrap;}
  .tvc-promo-cta:hover{border-bottom-color:#fff; text-decoration:none;}
  .tvc-promo-txt-s{display:none; font-size:13px; font-weight:700;}
  @media(max-width:700px){
    .tvc-promo-in{padding:7px 14px; gap:8px; flex-wrap:nowrap;}
    .tvc-promo-lab, .tvc-promo-txt, .tvc-promo-cta{display:none;}
    .tvc-promo-txt-s{display:inline;}
    .tvc-promo-code{padding:4px 9px; font-size:12.5px;}
  }
  @media(max-width:360px){ .tvc-promo-code em{display:none;} }
  @media(prefers-reduced-motion:reduce){ .tvc-promo::after{animation:none; display:none;} }
  @media print{ .tvc-promo{display:none;} }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'tvc-promo';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Launch offer');
  bar.innerHTML =
    '<div class="tvc-promo-in">' +
      '<span class="tvc-promo-lab"></span>' +
      '<span class="tvc-promo-txt"></span>' +
      '<span class="tvc-promo-txt-s"></span>' +
      '<button class="tvc-promo-code" type="button" aria-label="Copy the discount code">' +
        '<span class="tvc-promo-codetext"></span><em>copy</em>' +
      '</button>' +
      '<a class="tvc-promo-cta" target="_blank" rel="noopener"></a>' +
    '</div>';

  /* textContent, not innerHTML — the offer strings are data, and this keeps a
     stray & or < in a future edit from breaking the markup. */
  bar.querySelector('.tvc-promo-lab').textContent = PROMO.label;
  bar.querySelector('.tvc-promo-txt').textContent = PROMO.text;
  bar.querySelector('.tvc-promo-txt-s').textContent = PROMO.textShort || PROMO.text;
  bar.querySelector('.tvc-promo-codetext').textContent = PROMO.code;
  const cta = bar.querySelector('.tvc-promo-cta');
  cta.textContent = PROMO.cta + ' →';
  cta.href = PROMO.url;

  document.body.insertBefore(bar, document.body.firstChild);

  /* ---- make room for it -------------------------------------------------
     Every page has a sticky header pinned at top:0, and two pages pin a
     secondary panel below that. Push each one down by the strip's height so
     nothing hides underneath, and shift anchor landings by the same amount. */
  const pinned = [];
  document.querySelectorAll('body *').forEach(el => {
    if (el === bar || bar.contains(el)) return;
    const cs = getComputedStyle(el);
    if (cs.position !== 'sticky') return;
    const top = parseFloat(cs.top);
    if (isNaN(top)) return;
    pinned.push({ el: el, base: top });
  });

  function fit() {
    const h = bar.offsetHeight;
    pinned.forEach(p => { p.el.style.top = (p.base + h) + 'px'; });
    document.documentElement.style.scrollPaddingTop = h + 'px';
  }
  fit();
  addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  /* ---- copy the code ---------------------------------------------------- */
  const btn = bar.querySelector('.tvc-promo-code');
  const codeEl = bar.querySelector('.tvc-promo-codetext');
  const note = btn.querySelector('em');
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(PROMO.code); }
    catch (e) {
      /* clipboard refused (old browser, or an insecure context) — select it
         instead so the reader can still copy with the keyboard */
      const r = document.createRange();
      r.selectNodeContents(codeEl);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    btn.classList.add('done');
    note.textContent = 'copied';
    if (window.gtag) gtag('event', 'promo_code_copied', { promo_code: PROMO.code });
    setTimeout(() => { btn.classList.remove('done'); note.textContent = 'copy'; }, 2200);
  });

  /* The CTA is an outbound link to Notion Press, so analytics.js already logs
     it as buy_click. This extra event is what separates a sale the strip earned
     from one the buy cards earned. */
  cta.addEventListener('click', () => {
    if (window.gtag) gtag('event', 'promo_click', { promo_code: PROMO.code });
  });
})();
