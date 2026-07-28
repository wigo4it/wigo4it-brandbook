# Wigo4it Brandbook

## Over dit project

Dit repository bevat het (onofficiele) brandbook van Wigo4it: een statische HTML/CSS/JS set met merkrichtlijnen, design-system documentatie en voorbeeldpagina's.

De site is opgebouwd als losse pagina's met gedeelde assets (fonts, logo's, iconen, vormen), aangevuld met Tailwind via CDN op pagina-niveau.

## Belangrijkste pagina's

- `index.html`: hoofd-merkgids
- `design-system.html`: design-system documentatie en utility-overzicht
- `examples.html`: overzicht met voorbeeldtoepassingen
- `examples/dashboard.html`: dashboardvoorbeeld met KPI's, charts, tabellen en datavis-richtlijnen
- `examples/slide-deck.html`: uitgebreid presentatievoorbeeld met meerdere slidepatronen
- `logos.html`: logo-overzicht met download per logo, diapositieve varianten op een donkere tegel
- `icons.html`: iconenoverzicht met download per icoon
- `shapes.html`: vormenoverzicht met download per vorm
- `photos.html`: fotogalerij met download per foto
- `pdf.html`: markdown naar een A4-document in de huisstijl, met `pdf-syntax.html` als naslag
- `deck.html`: markdown naar een slide-deck met reveal.js, met `deck-templates.html` (alle layouts) en
  `deck-syntax.html` (het auteursformaat) als naslag
- `assets.json`: machine-leesbaar manifest van alle downloadbare assets, en de bestandslijst waar de overzichtspagina's en de deck-tool op draaien

## Mappenstructuur

```text
wigo4it-brandbook/
├── README.md
├── CLAUDE.md                  werkafspraken en architectuur
├── brandColors.md
├── assets.json                manifest van img/, gegenereerd
├── index.html                 merkgids
├── design-system.html
├── examples.html
├── logos.html                 ┐
├── icons.html                 │ overzichten, gevuld uit assets.json
├── shapes.html                │
├── photos.html                ┘
├── pdf.html                   ┐
├── pdf-syntax.html            │ markdown naar A4-document
├── deck.html                  │
├── deck-view.html             │ markdown naar slide-deck
├── deck-templates.html        │
├── deck-syntax.html           ┘
├── styles/
│   ├── w4.css                 het merk: kleuren, fonts, helpers
│   ├── tool.css               skelet van de toolpagina's
│   ├── pdf.css                A4-preview en printregels
│   └── deck.css               reveal-thema en template-galerij
├── scripts/
│   ├── nav.js                 topnav op elke pagina
│   ├── tool-nav.js            tabrij binnen de tools
│   ├── tailwind-config.js     Tailwind-tokens, gedeeld
│   ├── assets.js              ingang naar assets.json
│   ├── generate-assets.py     schrijft assets.json uit img/
│   ├── animations.js          alleen index.html
│   ├── zip-download.js        "download alles" op de overzichten
│   ├── pdf-builder.js         ┐ logica en UI, per tool gescheiden
│   ├── pdf-app.js             │
│   ├── deck-builder.js        │
│   ├── deck-app.js            │
│   ├── deck-view.js           │
│   └── deck-templates.js      ┘ de templates als markdown
├── tests/                     Playwright-smoke tests, zie CI
├── examples/
│   ├── dashboard.html + .css
│   ├── slide-deck.html + .css
│   ├── deck-voorbeeld.md      het deck dat de tool standaard toont
│   └── deck-test.md           elke layout plus de randgevallen
├── docs/                      merkgidsen als PDF
├── fonts/                     niet in git, zie .gitignore
└── img/
    ├── icons/
    ├── logo/
    ├── photos/
    └── shapes/
```

## Ontwikkelworkflow

1. Start een lokale static server in de repository-root (`python -m http.server`). De
   overzichtspagina's en de tools halen `assets.json` op en werken dus niet via `file://`.
2. Pas gedeelde stijlen aan in `styles/w4.css`, en het skelet van de tools in `styles/tool.css`.
3. Pas pagina-specifieke stijlen aan in de bijbehorende CSS-bestanden (bijvoorbeeld `styles/deck.css`
   of `examples/dashboard.css`).
4. Houd documentatie in `design-system.html` synchroon met de daadwerkelijke implementaties in de voorbeelden.
5. Ververs hard (Ctrl+Shift+R) na een wijziging in `scripts/` of `styles/`; browsers houden
   ES-modules vast en je debugt anders de vorige versie.
6. Draai `pytest` voordat je pusht. Zie [Tests](#tests).

## Tests

Er is geen build-stap, wel een CI-gate. `tests/` serveert de repo als static site en laat
Playwright elke `.html` openen: geeft de pagina 200, crasht er geen JavaScript, laden alle
eigen assets, rendert er tekst. Plus een drift-check die `assets.json` opnieuw genereert en
faalt als het niet meer klopt met `img/`.

```bash
pip install -r requirements-dev.txt
python -m playwright install chromium
pytest
```

Nieuwe pagina's worden vanzelf meegetest; de test globt alle `.html` onder de root.

## Voorbeelden

### Slide deck (`examples/slide-deck.html`)

- Bevat meerdere herbruikbare slidepatronen: cover, agenda, statement, timeline, content-split, quote, intermezzo en closing.
- Inclusief screenshot-geinspireerde varianten met sterke typografische hiërarchie en decoratieve vormtaal.
- Navigatie met knoppen, keyboard controls (pijltjes, PageUp/PageDown, spatie) en voortgangsdots.

### Dashboard (`examples/dashboard.html`)

- Bevat KPI-kaarten, chart-kaarten, tabelsectie en guidanceblokken voor visualisatiekeuzes.
- Gebruikt Chart.js via CDN voor lijn-, donut-, stacked bar- en scatter-visualisaties.
- Ontworpen als voorbeeld voor data-gedreven pagina's binnen dezelfde merktaal.

## Assets downloaden

Iconen, vormen, foto's en logo's zijn vrij te gebruiken binnen de merkrichtlijnen.

**Voor mensen:** open `logos.html`, `icons.html`, `shapes.html` of `photos.html`. Elke asset heeft een
**Download**-knop en een **Kopieer pad**-knop, en boven de lijst zit een
**Download alles (ZIP)**-knop die de hele categorie in één keer inpakt (client-side, via JSZip).

**Voor een agent of script:** `assets.json` in de root is een machine-leesbaar manifest van
alle assets met een kant-en-klare download-URL per stuk. Geef de site-URL aan een agent en die
kan `assets.json` ophalen om alles te vinden:

```
https://wigo4it.github.io/wigo4it-brandbook/assets.json
```

Elke asset heeft `name`, `file`, `path`, `url`, `format` en `bytes`. Gebruik de `url`
direct, of plak een `path` achter `baseUrl`. De categorieën zijn `icons`, `shapes`, `photos`
en `logos`.

Het manifest is ook de bron voor de site zelf: de vier overzichtspagina's vullen er hun
galerij mee en de deck-tool controleert er `shape:`/`icon:` tegen. Eén lijst, geen kopieën
die uit de pas kunnen lopen.

Het manifest wordt door `scripts/generate-assets.py` uit `img/` gegenereerd. De Pages-workflow
draait dat script bij elke deploy, dus de live `assets.json` blijft vanzelf actueel. Handmatig
verversen na het toevoegen of verwijderen van assets:

```
python scripts/generate-assets.py
```

## Typografie

- PP Neue Machina: heading/display
- Raleway: body/UI-tekst

## Notities

- Design tokens en basisstijlen staan in `styles/w4.css`.
- `design-system.html` documenteert naast foundations nu ook datavisualisatie-, dashboard- en presentatiepatronen.
- Voor donkere achtergronden gebruik je het diapositief-logo (`img/logo/Logo Diap.svg`) voor voldoende contrast.

---

Versie 1.1 · laatst bijgewerkt: juli 2026
