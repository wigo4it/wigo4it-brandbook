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
- `icons.html`: iconenoverzicht met download per icoon
- `shapes.html`: vormenoverzicht met download per vorm
- `photos.html`: fotogalerij met download per foto
- `assets.json`: machine-leesbaar manifest van alle downloadbare assets

## Mappenstructuur

```text
wigo4it-brandbook/
├── README.md
├── brandColors.md
├── index.html
├── design-system.html
├── examples.html
├── icons.html
├── shapes.html
├── style.css
├── styles/
│   └── w4.css
├── scripts/
│   └── animations.js
├── docs/
│   └── screenshots/
├── examples/
│   ├── dashboard.css
│   ├── dashboard.html
│   ├── slide-deck.css
│   └── slide-deck.html
├── fonts/
│   ├── PP Neue Machina/
│   └── raleway/
└── img/
    ├── icons/
    ├── logo/
    ├── photos/
    └── shapes/
```

## Ontwikkelworkflow

1. Open een pagina direct in de browser, of start een lokale static server in de repository-root.
2. Pas gedeelde stijlen aan in `styles/w4.css`.
3. Pas pagina-specifieke stijlen aan in de bijbehorende CSS-bestanden (bijvoorbeeld `examples/slide-deck.css` of `examples/dashboard.css`).
4. Houd documentatie in `design-system.html` synchroon met de daadwerkelijke implementaties in de voorbeelden.

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

Iconen, vormen en foto's zijn vrij te gebruiken binnen de merkrichtlijnen.

**Voor mensen:** open `icons.html`, `shapes.html` of `photos.html`. Elke asset heeft een
**Download**-knop en een **Kopieer pad**-knop, en boven de lijst zit een
**Download alles (ZIP)**-knop die de hele categorie in één keer inpakt (client-side, via JSZip).

**Voor een agent of script:** `assets.json` in de root is een machine-leesbaar manifest van
alle assets met een kant-en-klare download-URL per stuk. Geef de site-URL aan een agent en die
kan `assets.json` ophalen om alles te vinden:

```
https://wigo4it.github.io/wigo4it-brandbook/assets.json
```

Elke asset heeft `name`, `file`, `path`, `url`, `format` en `bytes`. Gebruik de `url`
direct, of plak een `path` achter `baseUrl`.

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
