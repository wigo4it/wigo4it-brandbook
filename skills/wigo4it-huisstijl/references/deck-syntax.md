# Deck-syntax

Het auteursformaat van de slide-tool. Een deck is één markdown-bestand. In andere viewers blijft
het leesbaar, want alle opmaak zit in HTML-comments.

De officiële versie van deze pagina staat op
https://wigo4it-brandbook.azurewebsites.net/deck-syntax.html

## Frontmatter

Optioneel, bovenaan het bestand, tussen twee regels met `---`.

```markdown
---
title: Van output naar outcome
footer: Wigo4it - jaarplan 2026
---
```

`footer` komt linksonder op elke slide, behalve op de cover en de afsluiter. Staat er geen `footer`,
dan wordt `title` gebruikt. Het veld in de tool wint van allebei. Alleen platte `sleutel: waarde`,
geen lijsten of nesting.

## Scheidingstekens

| Teken | Betekenis |
| --- | --- |
| `---` | volgende slide (op een eigen regel) |
| `--` | verticale slide eronder, voor verdieping die je alleen toont als iemand ernaar vraagt |
| `***` | scheiding tussen twee helften, bij `split`, `before-after` en `stacked` |
| `###` | start een item |
| `Note:` | alles daarna is sprekersnotitie, zichtbaar met toets S |

Een lege slide valt weg, dus een dubbele `---` maakt niets kapot.

## De regel die alles verklaart

**Een `###`-kop start een item.** Of daar kaarten, een tijdlijn, een agenda of een rij cijfers van
worden, bepaalt alleen het layout-token. Alles wat vóór de eerste `###` staat blijft er als titel
boven staan.

Dus dit:

```markdown
## Wat komt er langs

### Waar we vandaan komen

De doelen zoals ze nu op papier staan.

### Wat er verandert

Van opleveren naar resultaat.
```

is met `columns` een rij kaarten, met `timeline` een tijdlijn, met `agenda` een genummerde lijst
en met `kpi` twee grote cijfers. Dezelfde tekst, ander token.

## De tokenregel

Eén HTML-comment op een eigen regel, bovenaan de slide:

```markdown
<!-- w4: green statement icon:Rocket -->
```

Volgorde maakt niet uit. Meerdere tokenregels in één slide worden samengevoegd. Zit er een spatie
in een waarde, zet 'm dan tussen dubbele quotes: `icon:"Game Boy"`. Zonder quotes knipt de tool op
de spatie en zoekt hij een icoon dat `Game` heet.

### Kleur

`green` `aubergine` `blue` `pink` `red` `yellow` `grey` `white`

Zonder kleurtoken is een slide wit. Op een donkere kleur (green, aubergine, blue, pink, red) wordt
de tekst automatisch wit en wisselt het logo naar de diapositieve versie. Daar hoef je niets voor
te zetten. Welke kleur wanneer: zie `huisstijl.md`.

### Layout

`cover` `statement` `section` `quote` `end` `split` `columns` `list` `agenda` `timeline` `kpi`
`contrast` `before-after` `stacked` `table` `photo`

Zonder layout-token krijg je een gewone slide: titel plus tekst. Dat is prima voor een slide met
een lijstje of een alinea. Wat elke layout doet en wanneer je 'm pakt staat in `deck-layouts.md`.

### Decoratie

| Token | Wat het doet |
| --- | --- |
| `accent:kleur` | kleur van badges, cijfers en lijnen, los van de achtergrond |
| `eyebrow:"tekst"` | klein label boven de titel |
| `ghost:tekst` | groot, vaag nummer of woord op de achtergrond |
| `shape:naam` | vorm uit de brandbook-assets, met `@topleft`, `@topright`, `@bottomleft` of `@bottomright` |
| `icon:Naam` | icoon uit de brandbook-assets |
| `steps` | lijstitems verschijnen een voor een |
| `transition:naam` | `slide`, `fade`, `convex` of `none`, alleen voor deze slide |

Zonder `accent:` kiest de achtergrondkleur zelf een accent dat leesbaar is: geel op een donkere
kleur, groen op geel, grijs en wit. Zet alleen een eigen accent als je een reden hebt.

Namen achter `shape:` en `icon:` worden gecontroleerd tegen `assets.json`. Staat een naam er niet
in, dan meldt de tool dat, met de dichtstbijzijnde naam erbij. Gebruik alleen namen uit
`assets.md`. Shape-namen zijn kleine letters met koppeltekens (`quarter-ring-bottom-left`),
icoon-namen beginnen met een hoofdletter (`Rocket`, `"Game Boy"`).

Onbekende tokens worden niet stilletjes genegeerd: de tool zet ze in een waarschuwing. Dat is
prettig, maar los ze op voordat je oplevert.

## Verticale slides

```markdown
<!-- w4: aubergine steps -->

## Stap voor stap

- Eerst dit
- Dan dit

--

<!-- w4: aubergine -->

### Verdieping

Detail dat je alleen laat zien als iemand ernaar vraagt.
```

Pijltje omlaag om erheen, omhoog om terug. Gebruik dit voor de vraag die je verwacht maar niet in
je verhaal wilt hebben. Zet er niet je halve deck in: wat niemand vindt, bestaat niet.

## Sprekersnotities

```markdown
## De titel op de slide

Weinig tekst.

Note: Hier staat wat je zegt. Meerdere alinea's mag, markdown werkt gewoon.
```

Alles vanaf `Note:` tot het einde van de slide is notitie. De spreker ziet het met toets S.

## Afbeeldingen

Bij `photo` gebruik je Markdown-afbeeldingen. Bij `canvas` gebruik je HTML-afbeeldingen,
zoals verderop beschreven. Verwijs relatief naar de brandbook-map:

```markdown
<!-- w4: photo -->

![](img/photos/team-meeting.jpg)

## De tekst staat onderaan
```

De eerste afbeelding in de slide wordt de achtergrond, met een tint eroverheen zodat de tekst
leesbaar blijft. Bij `canvas` bepaal je zelf de positie en afmetingen.

## Presenteren

Pijltjestoetsen om te navigeren, `F` voor volledig scherm, `S` voor de sprekersweergave met
notities, `Esc` voor een overzicht van alle slides.


## Vrije compositie: canvas

Voor het nabouwen van bestaande slides is er `canvas`. Gebruik binnen een
`<div class="w4-canvas">` HTML-elementen met `--x`, `--y`, `--w` en `--h` in pixels.
Het werkvlak is 1600 × 900. Reveal schaalt de hele compositie mee.
Tekst gebruikt `w4-canvas-text` met `--size`, optioneel `--leading` en `--weight`.
Een `w4-canvas-art` met `data-asset="img/shapes/ring.svg"` gebruikt de originele
asset als masker; `color:var(--dark-green)` bepaalt de kleur. Ook iconen werken zo.
Afbeeldingen gebruiken gewone `<img>`-elementen met een pad vanaf de repo-root.
`w4-canvas-inline` zet een icoon in een tekstregel. De automatische footer en het
logo zijn bij deze layout verborgen: plaats het bestaande logo zelf waar de bron
dat vraagt. Zie `examples/cijfers-resultaten-2024.md` voor een volledig voorbeeld.
Deze layout is de uitzondering op de gewone Markdown-voorkeur, bedoeld voor
getrouwe reconstructies. Nieuwe presentaties gebruiken bij voorkeur de vaste layouts.
