# `the-value-cube/` — the public book site

A complete, standalone static site for *The Value Cube* — self-contained, no build step. Drop the folder on any static host. The only third-party JavaScript is Google Analytics, in its cookieless mode; see **Analytics** below.

| File | What it is |
|---|---|
| `index.html` | Landing page — the idea, the book (with buy links + QR codes), the two free tools, the toolkit request |
| `cube.html` | Interactive Value Cube — six faces, 54 cubelets, five cross-cutting dimensions, deep-linkable |
| `score.html` | Cube Score calculator — six faces + five dimensions → guardrail-capped score, maturity band, evidence label |
| `tradeoffs.html` | The 6×6 face interaction matrix — what optimizing one face does to the other five |
| `privacy.html` | What the site measures, what it does not, and a working opt-out switch |
| `assets/qr.js` | QR encoder (byte mode, ECC L, versions 1–10), shared by `index.html` and `cube.html` |
| `assets/analytics.js` | Google Analytics 4 loader plus the event tracking. **The Measurement ID goes here.** |
| `assets/cover.jpg` | 600×900 web cover, from `book/cover/C2Valis_Front_Cover.png` |

This folder supersedes the earlier draft in `site/` for public use. `site/` is left as-is.

## Theme

One light theme across all three pages. The single exception is the **stage panel** on `cube.html` — the box the 3D cube lives in stays dark, because the cube's six faces are white cards and they only read as objects with depth against a dark ground. The particle field is scoped to that panel (the `#bg` canvas is a child of `.stage-panel` and sizes itself to it), so it can't leak onto the light page. Everything else on the cube page — top bar, header, breadcrumb, detail panel, book panel, footer — matches `index.html` and `score.html`.

If you ever restyle: `--line` is the line colour *inside* the dark stage (white alpha), `--line-l` is for the light chrome. Don't cross them.

## Retail links — the one place to edit

Both `index.html` (bottom `<script>`, `STORES`) and `cube.html` (top of its `<script>`, `BOOK.stores`) hold the same two entries. QR codes are generated in the browser from those strings, so editing the URL is the whole update — no image files, no rebuild.

Live now:

- **Notion Press** — <https://notionpress.com/in/read/the-value-cube/> (paperback & hardcover, 400 pp, 6×9, ISBN 9798906061492)
- **Amazon.in** — <https://www.amazon.in/dp/B0HBPGM43Q>
- **Amazon.com** — <https://www.amazon.com/dp/B0HBP7VHBD>
- **Amazon.co.uk** — <https://www.amazon.co.uk/dp/B0HBP7VHBD>

Listed as *coming soon* (no link, no claim): Flipkart and further channels. When one goes live, add it to `STORES` in `index.html` and `BOOK.stores` in `cube.html` — the card grid reflows on its own — then drop it from the "Coming soon" paragraph.

`BOOK.siteUrl` in `cube.html` and the `canonical`/`og:` URLs in all three `<head>`s currently assume `https://the-value-cube.github.io/`. Change them together if the site lands elsewhere.

## The Cube Score calculator

`score.html` implements Chapter 16 exactly:

- **Score** = the average of the six face scores, rounded to one decimal.
- **Guardrail caps** — governance below 2 → ceiling 3; Quality & Trust below 2 → ceiling 3; a high-risk use case without risk classification → ceiling 2; cost visibility missing (Face 1 = 0) → ceiling 2. The lowest triggered ceiling wins.
- A triggered cap that sits *above* the average is shown as armed-but-not-binding rather than applied — it can't lower a score it's already above.
- **Bands** — 0.0–0.9 Blind Spend · 1.0–1.9 Visible · 2.0–2.9 Controlled · 3.0–3.9 Managed · 4.0–4.5 Optimized · 4.6–5.0 Intelligent ValueOps.
- Every result carries the **evidence-quality label** (Low / Medium / High / Verified).
- "Load the book's running example" fills the Enterprise RAG Knowledge Assistant profile (3, 1, 2, 2, 2, 2) and reproduces the book's **2.0 / Controlled**, evidence Low.

The page opens unscored (`–/5`) rather than at a fabricated zero, and states plainly that it is a structured diagnostic, not validated ROI.

## Deep links (`cube.html`)

`#face-3` · `#face-3-7` (cubelet) · `#all-54` · `#dimensions` · `#dim-b` · `#book`. The URL updates as you navigate, so any view is shareable.

## Analytics

All of it lives in `assets/analytics.js`, included at the bottom of every page
with a `data-page` attribute that tells it which page it is on. It attaches its
own delegated listeners and never reaches into the page scripts, so the cube,
the calculator and the matrix can be edited freely without breaking measurement.

**To switch it on:** create a GA4 property at analytics.google.com (Admin →
Create → Property → Web data stream for `the-value-cube.github.io`), then paste
the `G-…` Measurement ID into `GA_MEASUREMENT_ID` at the top of the file and
publish. Until a real ID is there the file loads nothing at all, so the site is
safe to ship untagged.

**Cookieless by default.** `COOKIELESS = true` sets `client_storage: 'none'`, so
GA writes nothing at all to the visitor's device — no cookie, no identifier —
and no consent banner is owed to UK/EU visitors for storage. Advertising
signals are refused unconditionally, separately from that flag.

The cost is confined to two metrics: GA mints a fresh anonymous ID on every page
load, so **"users" and "sessions" roughly track pageviews rather than people.**
Ignore those two. Pageviews, events, pages, and traffic sources are all exact.

Set `COOKIELESS = false` for standard GA4 with accurate users and sessions —
but then you owe UK/EU visitors a consent banner before it may run, and
`privacy.html` needs rewriting to match.

> **Do not** "improve" this by denying `analytics_storage` in the consent
> defaults. It looks more private but downgrades every hit to a cookieless ping
> with no client or session ID, which GA only uses as input to behavioural
> modelling — and modelling needs roughly 1,000 denied events a day for 7 days
> *plus* 1,000 consenting users a day before it activates. Under that threshold
> the data arrives and the reports stay empty. The comment in `analytics.js`
> says the same thing; it is there because this exact mistake was made once.

**Your own visits don't count.** Local previews are skipped entirely. On the
live site, open any page once with `?tvc-optout=1` and that browser is silenced
for good; `?tvc-optout=0`, or the switch on `privacy.html`, turns it back on.

**Events sent** beyond the automatic pageview:

| Event | Fires when | Parameters |
|---|---|---|
| `buy_click` | a Notion Press or Amazon link is clicked | `store`, `link_url`, `source_page` |
| `outbound_click` | any external link is clicked | `link_domain`, `link_url`, `link_text`, `source_page` |
| `toolkit_request` | the toolkit `mailto:` is opened | `source_page` |
| `cube_view` | a face, cubelet or dimension is opened on `cube.html` | `cube_view_id`, `cube_view_kind` |
| `score_started` | the first score input is changed | — |
| `score_example` · `score_share` · `score_copy` · `score_print` | those buttons are pressed | — |
| `score_shared_link_opened` | someone arrives on a shared score link | — |
| `tradeoff_cell` | a matrix cell is opened | `face_pair` |
| `page_not_found` | `404.html` is served | `not_found_path`, `not_found_referrer` |

> **One-time setup in GA:** custom parameters like `store` and `cube_view_id`
> are recorded immediately but stay invisible in reports until you register
> them. In GA4: Admin → Custom definitions → Create custom dimension, scope
> *Event*, one per parameter you want to break results down by. `store` is the
> one worth doing first.

Two things GA cannot tell you, so wire them up separately: **Google Search
Console** and **Bing Webmaster Tools** report the queries that find the site.
Verification meta tags are stubbed, commented out, in the `<head>` of
`index.html`; `sitemap.xml` and `robots.txt` are already in place.

## Campaign tagging

Analytics can only attribute a visit if the link says where it came from.
`marketing/POSTING_PACK.md` holds the ready-to-paste tagged links. The
convention: **clickable placements get full UTMs; printed and scanned ones get a
short `?src=`**, which `analytics.js` translates into campaign fields — a
shorter URL makes a denser QR easier to scan. `?src=book-label` is already baked
into `tools/book-labels/labels.html`.

## Hosting

The repo is private, so GitHub Pages needs a plan that permits private-repo publishing — otherwise push this folder to a public repo. Either serve it from `/docs` on a branch, or upload it as the artifact in a Pages Actions workflow. No Jekyll processing is needed, so no `.nojekyll` file is required.

## Toolkit requests

The toolkit CTA is a plain `mailto:` to sanjeev.azad@gmail.com with a prefilled subject and body. No form service, no list, no third party.
