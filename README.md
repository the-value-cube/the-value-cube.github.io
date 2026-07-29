# `the-value-cube/` — the public book site

A complete, standalone static site for *The Value Cube* — self-contained, no build step, no CDN JavaScript, no analytics, nothing tracked. Drop the folder on any static host.

| File | What it is |
|---|---|
| `index.html` | Landing page — the idea, the book (with buy links + QR codes), the two free tools, the toolkit request |
| `cube.html` | Interactive Value Cube — six faces, 54 cubelets, five cross-cutting dimensions, deep-linkable |
| `score.html` | Cube Score calculator — six faces + five dimensions → guardrail-capped score, maturity band, evidence label |
| `assets/qr.js` | QR encoder (byte mode, ECC L, versions 1–10), shared by `index.html` and `cube.html` |
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

## Hosting

The repo is private, so GitHub Pages needs a plan that permits private-repo publishing — otherwise push this folder to a public repo. Either serve it from `/docs` on a branch, or upload it as the artifact in a Pages Actions workflow. No Jekyll processing is needed, so no `.nojekyll` file is required.

## Toolkit requests

The toolkit CTA is a plain `mailto:` to sanjeev.azad@gmail.com with a prefilled subject and body. No form service, no list, no third party.
