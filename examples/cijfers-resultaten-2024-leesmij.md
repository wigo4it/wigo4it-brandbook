# Cijfers en resultaten 2024

De 11 slides uit de PowerPoint zijn nagebouwd in de Markdown-decktool van deze repo.
Die gebruikt reveal.js. Tekst en cijfers zijn HTML-tekst, geen screenshots.

Open `cijfers-resultaten-2024.html` in een browser om direct te presenteren.
Fonts, iconen, vormen en bronillustraties zitten in dat bestand. Voor reveal.js
en de sprekersweergave is internet nodig. Gebruik de pijltjestoetsen, F voor volledig
scherm en S voor de sprekersweergave.

Voor aanpassingen gebruik je `cijfers-resultaten-2024.md`. Start de repo lokaal
met `python -m http.server`, open `http://localhost:8000/deck.html` en sleep het
Markdown-bestand op het invoervlak. De lokale versie bevat de nieuwe `canvas`-layout.
De gepubliceerde site ondersteunt die pas nadat deze wijzigingen zijn gepubliceerd.

De vrije layout gebruikt posities op een werkvlak van 1600 × 900. De inhoud staat
per slide tussen `<div class="w4-canvas">` en `</div>`. Pas tekst, `--x`, `--y`,
`--w` of `--size` aan. De volledige syntax staat in de huisstijlskill.

## Controle

`check_deck.py` controleert de 11 slides, tokens en assetverwijzingen. De bron bevat
acht achtergrondkleuren en 81 woorden op de techniek-slide. Die twee waarschuwingen
zijn bewust behouden om de presentatie compleet na te bouwen. Ook de begin- en
eindslide gebruiken `canvas`, waardoor de checker hiervoor een algemene tip geeft.

De oorspronkelijke Engelse slogans zijn behouden. Lange streepjes tussen termen
zijn vervangen door middelpuntjes. De kleuren volgen de actuele brandbook-tokens.
De kleine bijschriften op de Socrates-slide zijn donkergroen voor beter contrast.
De cijfers zijn historische cijfers uit 2024, zonder nieuwe feitelijke claims.
