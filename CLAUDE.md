# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Wat dit is

Brandbook voor Wigo4it: losse HTML-pagina's met gedeelde assets, geserveerd door een kleine Node-server (`server/`) die ook presentaties opslaat. De pagina's zelf hebben geen build-stap of bundler; alleen `server/` heeft een `package.json`. Termen staan in `CONTEXT.md`, de hostingkeuze in `docs/adr/0001-app-service-met-sqlite.md`, het v2-plan in `docs/plan-v2.md`.

## Draaien en deployen

- Lokaal: `cd server && npm install && SESSION_SECRET=x APP_PASSWORD_HASH=$(npm run -s hash-password -- test) npm start` → http://localhost:8080. Een kale static server werkt nog voor alles behalve inloggen en publiceren.
- Deploy: push naar `main` → `.github/workflows/azure.yml` bouwt een zip (`scripts/package-app.sh`: getrackte bestanden zonder `tests/`, `infra/`, `.github/`, plus productie-`node_modules` en de skill-zip) en zet die op App Service `wigo4it-brandbook` in `rg-brandbook`. Pas na de CI-gate. `static.yml` (GitHub Pages) draait tijdelijk nog mee en gaat uit zodra Azure de enige plek is.
- Infra: `infra/main.bicep`. Secrets (`SESSION_SECRET`, `APP_PASSWORD_HASH`) geef je mee bij `az deployment group create`; opnieuw uitrollen zonder die parameters overschrijft ze.
- De server serveert niets uit `server/`, `tests/`, `infra/`, `tmp/`, `docs/adr/` en punt-mappen (`PRIVATE_PATHS` in `server/app.js`).

## Tests / CI

- De gate staat in `.github/workflows/ci.yml` (draait op elke PR naar `main` én wordt vóór deploy aangeroepen door `static.yml`).
- Servertests: `cd server && npm test` (node:test, API en auth).
- Wat de browsergate checkt: elke `.html`-pagina serveren via de echte Node-server (`tests/conftest.py` start hem met een lege database en testwachtwoord) en met Playwright/Chromium valideren dat de pagina 200 geeft, geen JS-crash of `console.error` heeft, geen kapotte eigen assets laadt (404 op shape/icon/foto) en echt tekst rendert. Plus: `generate-assets.py` opnieuw draaien en falen als `assets.json` niet meer klopt met `img/`.
- Bewust buiten de gate: alleen externe CDN's (Tailwind, GSAP). Al het andere dat een pagina van onze eigen origin ophaalt, moet er zijn. Nieuwe pagina's worden automatisch meegetest; de test globt alle `.html` onder de repo-root.
- Aparte controle: `test_url_references_match_the_filesystem_exactly` loopt elke `url()` in de HTML en CSS na tegen het bestandssysteem, **inclusief hoofdlettergebruik**. De browsertest ziet dat niet: die serveert via Windows, en dat is hoofdletterongevoelig. GitHub Pages draait op Linux en is dat niet.
- `tests/test_present.py`: publiceren in de tool, permalink als buitenstaander, privé achter login.
- Lokaal draaien: `pip install -r requirements-dev.txt && python -m playwright install chromium && pytest` (Node 24 nodig).

## Architectuur

Elke pagina is zelfstandig en laadt dezelfde brand-laag plus Tailwind via CDN. Er is bewust geen shared JS-framework of componentsysteem; herbruikbaarheid loopt via CSS-classes en gekopieerde HTML-patronen.

**Drie stijllagen, in deze volgorde:**
1. `styles/w4.css` — de bron van waarheid voor het merk. Bevat de 8 brand-kleuren als CSS custom properties (`--dark-green`, `--aubergine`, etc.), de `@font-face` declaraties, base-typografie en de `w4-*` compositie-helpers (o.a. `.w4-cover`, `.w4-shape`, cover-motieven). **Kleuren, fonts of shape-helpers aanpassen doe je hier.**
2. Tailwind via CDN (`https://cdn.tailwindcss.com`), geconfigureerd in `scripts/tailwind-config.js`. Dat bestand laad je direct ná het CDN-script en het staat op elke pagina behalve `deck-view.html`, die geen Tailwind gebruikt. Het herhaalt dezelfde brand-kleuren (`dark-green`, `aubergine`, …) en font-families (`font-heading`, `font-body`) als Tailwind-tokens. Het is een superset: alles wat een enkele pagina nodig heeft zit erin, zodat er één config is in plaats van één per pagina. **Let op: kleuren staan hierdoor op twee plekken. Wijzig je een kleur, pas dan zowel `w4.css` als `scripts/tailwind-config.js` aan.**
3. `styles/tool.css` — het gedeelde skelet van de toolpagina's (tabrij, instellingenpaneel, velden, dropzone, knoppen) plus de `w4-doc-*`-opmaak van de readme-pagina's. Gebruikt door `pdf.html`, `deck.html` en hun readme-pagina's. **Chrome van een tool aanpassen doe je hier, niet in `pdf.css` of `deck.css`.** `pdf-syntax.html` en `deck-syntax.html` hebben hierdoor genoeg aan `w4.css` + `tool.css`; alleen `deck.html` en `deck-templates.html` laden ook `deck.css`, want die renderen echte slides.
4. Pagina-specifieke CSS: `styles/pdf.css` (voorblad, A4-preview, printregels), `styles/deck.css` (het reveal-thema plus de template-galerij), `examples/dashboard.css` en `examples/slide-deck.css`.

Er staat geen CSS meer los in de root; `style.css` en `index_oud.html` zijn weg (commit `5091724`). Nieuwe pagina's beginnen bij `styles/w4.css`.

**Pagina's:**
- `index.html` — hoofd-merkgids (scroll-pagina met animaties)
- `design-system.html` — foundations plus datavis-/dashboard-/presentatiepatronen
- `examples.html` + `examples/dashboard.html` + `examples/slide-deck.html`
- `logos.html`, `icons.html`, `shapes.html`, `photos.html` — overzichten, alle vier gevuld uit `assets.json`
- Tools (zie hieronder): `pdf.html`, `pdf-syntax.html`, `deck.html`, `deck-view.html`, `deck-templates.html`, `deck-syntax.html`

**Navigatie** zit op twee niveaus, allebei uit één bron: `scripts/nav.js` rendert de topnav op elke pagina, `scripts/tool-nav.js` de tabrij binnen de tools. Een tool of readme-pagina toevoegen is een regel in `GROUPS` in `tool-nav.js`, plus het bestand opnemen in de regex in `activeKey()` van `nav.js`. Een item in de topnav is een regel in `items` plus een regel in `activeKey()`. Let op de breedte: acht items passen op 1024px, meer niet vanzelf. `tests/test_pages.py::test_navbar_fits_on_a_normal_screen` valt om zodra de rij moet schuiven.

## De tools

Twee client-side tools die markdown omzetten naar iets in de huisstijl. Ze delen `tool.css` en de tabrij, verder niets.

**`pdf.html`** → markdown naar een A4-document. `scripts/pdf-builder.js` (pure logica) plus `scripts/pdf-app.js` (UI). Paged.js pagineert bij export; de browser print naar PDF. In de markdown zijn alleen `<!-- pagebreak -->` en ```` ```mermaid ````-blokken betekenisvol, de rest zet je in het paneel. Die blokken worden diagrammen via `scripts/mermaid-render.js` (mermaid van de CDN, alleen geladen als er een diagram staat); tekst achter `mermaid` op de fence-regel is het onderschrift. Het testdocument is `examples/pdf-test.md`.

**`deck.html`** → markdown naar een reveal.js-presentatie. `scripts/deck-builder.js` (pure logica) plus `scripts/deck-app.js` (UI); `deck-view.html` is de presentatie zelf, in een iframe als preview en in een eigen tab bij "Presenteer".

Het auteursformaat van een deck staat in de kop van `deck-builder.js` en op `deck-syntax.html`. Twee dingen om te weten voordat je erin duikt:

- **Een `###`-kop start een item.** Dat is de gedeelde conventie onder alle meervoudige layouts (`columns`, `list`, `agenda`, `timeline`, `kpi`, `contrast`). Dezelfde markdown wordt kaarten of een tijdlijn; alleen het layout-token verschilt. De bouwsteen is `collectItems()`. Een layout toevoegen is een renderer in `LAYOUT_RENDERERS` plus wat CSS.
- **Kleur loopt via `--slide-accent`.** De builder zet die per slide op de `<section>`; alles wat een accentkleur nodig heeft (badges, stamps, tijdlijnpunten, KPI-cijfers, lijnen) leest die ene variabele. Geen klasse per kleurcombinatie.

`deck-templates.html` rendert elke template met dezelfde `buildSlide()` als de tool, zonder reveal.js: op 1600×900 opgebouwd en met een transform teruggeschaald. De templates staan als markdown in `scripts/deck-templates.js`. **Nieuwe layout erbij? Zet 'm daar ook neer**, anders loopt het overzicht achter.

**Let op bij de slide-decoratie:** reveal schaalt de slide naar het venster maar schildert de achtergrondkleur over het hele scherm, ook over de balken bij een afwijkende verhouding. Daarom klipt `.w4-slide` niet zelf; de decoratie zit in `.w4-slide-decor`, die tot de echte beeldrand doorloopt. `fitDecoration()` meet die overhang en zet 'm als CSS-variabele. Zonder dat breekt een shape midden in het gekleurde vlak af. Diezelfde functie wordt via `toString()` in de HTML-export meegeschreven, zodat er één versie van bestaat.

**Animaties:** `scripts/animations.js` draait alleen op `index.html`. Het gebruikt GSAP + ScrollTrigger (CDN) en hangt reveal-animaties aan `main > section` op basis van DOM-conventies: het selecteert op `img[src*='logo']`, `img[src*='shapes']`, `.w4-shape`, `.w4-cover-meta` enzovoort. Nieuwe secties krijgen animaties gratis mee als je diezelfde classes/paden aanhoudt. `.w4-shape-static` sluit een shape uit van de zwevende ambient-motion. Respecteert `prefers-reduced-motion`.

**Assets** in `img/`: `shapes/` (SVG masks, aangestuurd via `mask`/`-webkit-mask` in de `w4-shape-*` classes), `icons/`, `logo/`, `photos/`. Shapes bestaan vaak als SVG én PNG. Voor donkere achtergronden: gebruik het diapositief-logo `img/logo/Logo Diap.svg`.

`assets.json` is het manifest van die map: vier categorieën (`icons`, `shapes`, `photos`, `logos`), gegenereerd door `scripts/generate-assets.py`. Het is niet alleen een download-manifest voor buiten, het is ook de bestandslijst die de site zelf gebruikt: `logos.html`, `icons.html`, `shapes.html` en `photos.html` vullen er hun galerij mee, en de deck-tool controleert er `shape:`/`icon:` tegen met een suggestie bij een typefout. Die toegang loopt via `scripts/assets.js` (`loadAssets`, `files`, `names`, `suggest`). **Voeg je iets toe aan `img/`, draai dan `python scripts/generate-assets.py`**, anders zie je het nergens terug en faalt de CI-drift-check. Gevolg van deze keuze: die vier pagina's halen een bestand op en werken dus niet meer via `file://`; serveren dus.

## Presentaties opslaan (v2)

- `server/app.js` (routes), `store.js` (SQLite via `node:sqlite`, in `DATA_DIR`, op Azure `/home/data`), `auth.js` (wachtwoord, sessiecookie, API-sleutels), `ids.js` (permalink-ids).
- Identiteit loopt via één functie: `currentOwner()` in `auth.js`. Fase 1 is één wachtwoord met eigenaar `gedeeld`; voor Entra (Easy Auth) lees je daar `x-ms-client-principal-id`.
- `/present/<id>` serveert `deck-view.html` met een ingevoegde `<base href="/">`; de viewer haalt de bron uit `/api/presentations/<id>`. Privé zonder recht geeft 404, nooit 403.
- Frontend: `scripts/brandbook-api.js` is de enige plek met fetch-calls naar de API. `deck.html` (Publiceer/Vervang, `?id=` laadt een bestaande), `presentaties.html`, `api.html` (curl-docs + sleutelbeheer), `login.html`. `nav.js` toont rechts Inloggen/Uitloggen als `/api/me` bereikbaar is.
- Skill: bron is de repo `wigo4it-claude-skills`; `skills/wigo4it-huisstijl/` hier is een kopie. De zip wordt bij deploy gebouwd en is niet ingecheckt.

## Merk

- Kleuren: light-grey `#cfd6cc`, dark-green `#005351`, dark-blue `#434d8e`, soft-yellow `#e9eb86`, light-green `#63cf92`, aubergine `#362c46`, bright-red `#f56e6d`, bright-pink `#bb55a9` (canoniek in `brandColors.md` en `styles/w4.css`).
- Fonts: **PP Neue Machina** voor headings/display, **Raleway** voor body/UI. Ze staan in `fonts/pp-neue-machina/` en `fonts/raleway/` en gaan mee in git; er is een licentie voor. Geladen via `@font-face` in `w4.css`, plus een eigen kopie van die regels in `design-system.html`, want die pagina laadt `w4.css` niet. **Paden in kleine letters zonder spaties houden**, anders werkt het lokaal wel en op Pages niet.

## Werkafspraken

- Houd `design-system.html` synchroon met wat de voorbeeldpagina's daadwerkelijk doen; het is documentatie, geen losse waarheid.
- Verander je iets aan het deck-formaat, werk dan `deck-syntax.html`, `scripts/deck-templates.js` en `examples/deck-test.md` mee bij. Die drie samen zijn de documentatie; loopt er een achter, dan is het overzicht niet meer te vertrouwen.
- `examples/deck-test.md` is het testdeck: elke layout plus de randgevallen (layout zonder de bijbehorende structuur, onbekende tokens, dubbele scheiding, tekst die niet past). Laad 'm na een wijziging in de builder.
- `docs/screenshots/*.png` en `pdf_to_screenshots.py` staan in `.gitignore`; die worden niet meegedeployed.
- Werk je lokaal aan `scripts/` of `styles/`, ververs dan hard (Ctrl+Shift+R). Browsers houden ES-modules in geheugen, en je debugt anders de vorige versie.
