# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Wat dit is

Statisch brandbook voor Wigo4it: losse HTML-pagina's met gedeelde assets. Geen build-stap, geen bundler, geen package.json. Je opent de HTML direct of serveert de repo-root als static site.

## Draaien en deployen

- Lokaal: open een pagina in de browser, of start een static server in de root (`python -m http.server` o.i.d.).
- Deploy: push naar `main` → GitHub Actions (`.github/workflows/static.yml`) publiceert de **hele repo** naar GitHub Pages. Alles wat je commit gaat mee, ook losse `.md`-bestanden. Deploy draait pas als de CI-gate groen is (`static.yml` roept `ci.yml` aan via `needs: test`).
- Geen build-stap. Wel een CI-gate: browser-smoke tests met Playwright (`tests/`) plus een `assets.json`-drift-check. Zie hieronder.

## Tests / CI

- De gate staat in `.github/workflows/ci.yml` (draait op elke PR naar `main` én wordt vóór deploy aangeroepen door `static.yml`).
- Wat het checkt: elke `.html`-pagina serveren via `http.server` en met Playwright/Chromium valideren dat de pagina 200 geeft, geen JS-crash of `console.error` heeft, geen kapotte eigen assets laadt (404 op shape/icon/foto) en echt tekst rendert. Plus: `generate-assets.py` opnieuw draaien en falen als `assets.json` niet meer klopt met `img/`.
- Bewust buiten de gate: externe CDN's (Tailwind, GSAP) en `fonts/` (staat in `.gitignore`, degradeert gracieus). Nieuwe pagina's worden automatisch meegetest; de test globt alle `.html` onder de repo-root.
- Lokaal draaien: `pip install -r requirements-dev.txt && python -m playwright install chromium && pytest`.

## Architectuur

Elke pagina is zelfstandig en laadt dezelfde brand-laag plus Tailwind via CDN. Er is bewust geen shared JS-framework of componentsysteem; herbruikbaarheid loopt via CSS-classes en gekopieerde HTML-patronen.

**Drie stijllagen, in deze volgorde:**
1. `styles/w4.css` — de bron van waarheid voor het merk. Bevat de 8 brand-kleuren als CSS custom properties (`--dark-green`, `--aubergine`, etc.), de `@font-face` declaraties, base-typografie en de `w4-*` compositie-helpers (o.a. `.w4-cover`, `.w4-shape`, cover-motieven). **Kleuren, fonts of shape-helpers aanpassen doe je hier.**
2. Tailwind via CDN (`https://cdn.tailwindcss.com`), per pagina geconfigureerd in een inline `tailwind.config`. Die config herhaalt dezelfde brand-kleuren (`dark-green`, `aubergine`, …) en font-families (`font-heading`, `font-body`). **Let op: kleuren staan hierdoor op twee plekken. Wijzig je een kleur, pas dan zowel `w4.css` als de `tailwind.config` in elke pagina aan.**
3. Pagina-specifieke CSS voor de voorbeelden: `examples/dashboard.css` en `examples/slide-deck.css`.

`style.css` (root) is legacy en wordt alleen door `index_oud.html` gebruikt. Niet aanraken voor nieuw werk; nieuwe pagina's gebruiken `styles/w4.css`.

**Pagina's:**
- `index.html` — hoofd-merkgids (scroll-pagina met animaties)
- `design-system.html` — foundations plus datavis-/dashboard-/presentatiepatronen
- `examples.html` + `examples/dashboard.html` + `examples/slide-deck.html`
- `icons.html`, `shapes.html` — overzichten

**Animaties:** `scripts/animations.js` draait alleen op `index.html`. Het gebruikt GSAP + ScrollTrigger (CDN) en hangt reveal-animaties aan `main > section` op basis van DOM-conventies: het selecteert op `img[src*='logo']`, `img[src*='shapes']`, `.w4-shape`, `.w4-cover-meta` enzovoort. Nieuwe secties krijgen animaties gratis mee als je diezelfde classes/paden aanhoudt. `.w4-shape-static` sluit een shape uit van de zwevende ambient-motion. Respecteert `prefers-reduced-motion`.

**Assets** in `img/`: `shapes/` (SVG masks, aangestuurd via `mask`/`-webkit-mask` in de `w4-shape-*` classes), `icons/`, `logo/`, `photos/`. Shapes bestaan vaak als SVG én PNG. Voor donkere achtergronden: gebruik het diapositief-logo `img/logo/Logo Diap.svg`.

## Merk

- Kleuren: light-grey `#cfd6cc`, dark-green `#005351`, dark-blue `#434d8e`, soft-yellow `#e9eb86`, light-green `#63cf92`, aubergine `#362c46`, bright-red `#f56e6d`, bright-pink `#bb55a9` (canoniek in `brandColors.md` en `styles/w4.css`).
- Fonts: **PP Neue Machina** voor headings/display, **Raleway** voor body/UI. Lokaal in `fonts/`, geladen via `@font-face` in `w4.css`.

## Werkafspraken

- Houd `design-system.html` synchroon met wat de voorbeeldpagina's daadwerkelijk doen; het is documentatie, geen losse waarheid.
- `docs/screenshots/*.png` en `pdf_to_screenshots.py` staan in `.gitignore`; die worden niet meegedeployed.
