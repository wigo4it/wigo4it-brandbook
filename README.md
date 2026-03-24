# Wigo4it Brandbook

## Over dit project

Dit repository bevat de Living Brand Book omgeving van Wigo4it: een statische HTML/CSS/JS set met merkrichtlijnen, design-system documentatie en voorbeeldpagina's.

## Belangrijkste pagina's

- `index.html`: hoofd-merkgids
- `design-system.html`: design-system documentatie en utility-overzicht
- `examples.html`: overzicht met voorbeeldtoepassingen
- `examples/dashboard.html`: dashboard voorbeeld
- `examples/slide-deck.html`: slide deck voorbeeld
- `icons.html`: iconenoverzicht
- `shapes.html`: vormenoverzicht

## Mappenstructuur

```text
wigo4it-brandbook/
├── index.html
├── design-system.html
├── examples.html
├── icons.html
├── shapes.html
├── css/
│   ├── w4.css
│   ├── w4-dashboard.css
│   └── w4-slide-deck.css
├── js/
│   └── w4.js
├── docs/
│   └── brandColors.md
├── examples/
│   ├── dashboard.html
│   └── slide-deck.html
├── fonts/
│   ├── neue-machina/
│   └── raleway/
└── img/
    ├── icons/
    ├── logo/
    ├── photos/
    └── shapes/
```

## Ontwikkelworkflow

1. Open de gewenste HTML-pagina direct in de browser of via een lokale static server.
2. Pas styles aan in `css/w4.css` (algemene stijlen en utilities) of in een van de pagina-specifieke CSS-bestanden.
3. Houd utility classes en voorbeelden in `design-system.html` synchroon met definities in `css/w4.css`.

## Typografie

- PP Neue Machina: heading/display
- Raleway: body/UI-tekst

## Notities

- Design tokens staan in `:root` van `css/w4.css`.
- Donkere modus gebruikt `html[data-theme="dark"]`.

---

Laatst bijgewerkt: maart 2026
