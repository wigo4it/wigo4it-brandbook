---
title: Deck-test
footer: Wigo4it - testdeck
---

<!-- w4: cover shape:ring@topright icon:Rocket -->

# Deck-test

Elke slide test iets anders. Loop 'm door en kijk of het klopt.

Note: Cover: groen zonder kleurtoken, diapositief logo, geen footer, geen slidenummer.

---

<!-- w4: white -->

## 1. Standaard slide

Geen layout-token, geen kleurtoken. Dit is de basis: witte achtergrond, zwarte tekst, logo rechtsboven, footer met tekst links en slidenummer rechts.

Tweede alinea om de regelafstand te zien. En wat **vet**, *cursief*, `inline code` en een [link](https://wigo4it.nl).

---

## 2. Slide zonder directive

Helemaal geen `<!-- w4: -->`-regel. Moet identiek zijn aan de vorige slide: wit is de default.

---

<!-- w4: grey -->

## 3. Alle acht kleuren

Deze acht slides staan achter elkaar. Let op het logo: op de vijf donkere kleuren hoort het diapositieve logo te staan, op grey, yellow en white het gewone.

- grey (deze slide)
- green, aubergine, blue, pink, red (donker)
- yellow, white (licht)

---

<!-- w4: green -->

## green

`var(--dark-green)` - donker, diapositief logo.

---

<!-- w4: aubergine -->

## aubergine

`var(--aubergine)` - donker, diapositief logo.

---

<!-- w4: blue -->

## blue

`var(--dark-blue)` - donker, diapositief logo.

---

<!-- w4: pink -->

## pink

`var(--bright-pink)` - donker, diapositief logo.

---

<!-- w4: red -->

## red

`var(--bright-red)` - donker, diapositief logo.

---

<!-- w4: yellow -->

## yellow

`var(--soft-yellow)` - licht, gewoon logo.

---

<!-- w4: white -->

## white

`#ffffff` - licht, gewoon logo. Kijk of de slide zich onderscheidt van de letterbox-rand.

---

<!-- w4: green statement -->

## 4. Statement

Grote kop, weinig tekst.

---

<!-- w4: white split -->

## 5. Split

Links dit blok, rechts het blok na `***`. Beide kolommen horen even breed te zijn en bovenaan uitgelijnd.

Nog een alinea links, zodat de kolommen ongelijk lang zijn.

***

### Rechterkolom

- Item een
- Item twee
- Item drie

---

<!-- w4: blue split -->

## 6. Split zonder scheiding

Deze slide heeft de layout `split` maar geen `***`. Dat hoort niets kapot te maken: gewoon een normale slide.

---

<!-- w4: white columns -->

## 7. Kolommen: twee kaarten

### Eerste

Alles onder een `###`-kop komt in die kaart terecht.

### Tweede

Twee kaarten horen breder te zijn dan drie.

---

<!-- w4: blue columns -->

## 8. Kolommen: drie kaarten

### Een

Korte tekst.

### Twee

Iets langere tekst, zodat de kaarten niet even hoog zijn en je ziet of ze netjes uitlijnen.

### Drie

Korte tekst.

---

<!-- w4: aubergine columns -->

## 9. Kolommen: vier kaarten

### Een

Vier is de stresstest.

### Twee

Passen ze naast elkaar of breken ze om?

### Drie

Let op de leesbaarheid van de tekst.

### Vier

En op de marges.

---

<!-- w4: grey columns -->

## 10. Kolommen zonder `###`

Deze slide gebruikt de layout `columns` maar heeft geen enkele `###`-kop. De builder hoort dit als gewone slide te laten staan, niet leeg te renderen.

---

<!-- w4: yellow quote -->

> Een citaat van een regel of twee, om te zien hoe groot de aanhaling wordt gezet.

Naamloze collega, dinsdagmiddag

---

<!-- w4: aubergine steps -->

## 11. Stappen

- Eerste item verschijnt
- Tweede item verschijnt
- Derde item verschijnt
- Vierde item verschijnt

Note: Klik vier keer. De items horen een voor een omhoog in te faden.

---

<!-- w4: white steps -->

## 12. Stappen in een genummerde lijst

1. Ook een `<ol>` hoort te werken
2. De fragments zitten op elke `<li>`
3. Klaar

---

<!-- w4: green shape:circle@topleft -->

## 13. Shape linksboven

`shape:circle@topleft`

---

<!-- w4: blue shape:diamond@topright -->

## 14. Shape rechtsboven

`shape:diamond@topright` - dit is ook de default-positie.

---

<!-- w4: pink shape:triangle-right@bottomleft -->

## 15. Shape linksonder

`shape:triangle-right@bottomleft`

---

<!-- w4: red shape:quarter-ring-top-left@bottomright -->

## 16. Shape rechtsonder

`shape:quarter-ring-top-left@bottomright`

---

<!-- w4: aubergine shape:semicircle-right -->

## 17. Shape zonder positie

`shape:semicircle-right` zonder `@` valt terug op rechtsboven.

---

<!-- w4: yellow shape:ring@nergens -->

## 18. Shape met onzin-positie

`shape:ring@nergens` - onbekende positie hoort terug te vallen op rechtsboven, niet de shape weg te laten.

---

<!-- w4: green icon:Koffie -->

## 19. Icoon

`icon:Koffie` op een donkere achtergrond. Kijk of het icoon leesbaar is of alleen een vage vlek.

---

<!-- w4: white icon:Pacman shape:pill-wide@bottomleft -->

## 20. Icoon plus shape

Beide tegelijk, op een lichte achtergrond.

---

<!-- w4: blue transition:zoom -->

## 21. Transitie: zoom

`transition:zoom` op deze ene slide. De volgende gebruikt weer de deck-instelling.

---

<!-- w4: pink transition:fade -->

## 22. Transitie: fade

`transition:fade`.

---

<!-- w4: white -->

## 23. Verticale stapel

Pijltje omlaag voor twee slides eronder, pijltje omhoog om terug te komen.

--

<!-- w4: green -->

### 23a. Eerste verdieping

Deze hangt onder de vorige.

--

<!-- w4: aubergine -->

### 23b. Tweede verdieping

En deze eronder. Slidenummers horen door te tellen, niet opnieuw te beginnen.

---

<!-- w4: white -->

## 24. Veel tekst

Een slide met meer tekst dan verstandig is, om te zien wat er gebeurt als de inhoud niet past. Loopt het over de rand, wordt het geschaald, of valt het onder de footer?

Wigo4it bouwt en beheert de ICT voor de sociale diensten van Amsterdam, Den Haag, Rotterdam en Utrecht. Dat betekent software waar mensen echt van afhankelijk zijn: een uitkering die op tijd wordt uitbetaald, een aanvraag die niet zoekraakt, een medewerker die zijn werk kan doen zonder tegen het systeem te vechten.

- Een lijstitem met een zin die net iets te lang is om op een regel te passen, zodat je ziet hoe hij afbreekt
- Nog een item
- En nog een
- En een vierde, voor de zekerheid

Laatste alinea, die er waarschijnlijk niet meer bij past.

---

<!-- w4: grey -->

## 25. Markdown-elementen

| Kolom | Waarde |
| --- | --- |
| Een | 1 |
| Twee | 2 |

```js
const deck = buildDeck({ source, renderMarkdown });
```

> Een blockquote buiten de quote-layout.

---

<!-- w4: white -->

## 26. Onbekend token

<!-- w4: paars glitter -->

De tokens `paars` en `glitter` bestaan niet. De tool hoort ze te melden als typefout, niet stil te negeren. De slide zelf is gewoon wit.

---

<!-- w4: white shape:rng icon:Zonn -->

## 26b. Asset die niet bestaat

`shape:rng` en `icon:Zonn` staan niet in `assets.json`. De tool hoort beide te melden met de dichtstbijzijnde naam erbij (`ring`, `Zon`). Op de slide zelf blijft de decoratie leeg; een gebroken plaatje-icoontje mag je hier zien.

---

<!-- w4: blue -->
<!-- w4: steps shape:square@bottomright -->

## 27. Twee directive-regels

- Tokens uit beide regels horen samengevoegd te worden
- Dus: blauw, stappen en een shape rechtsonder

---

---

<!-- w4: white -->

## 28. Lege slide ervoor

Tussen slide 27 en deze staan twee `---` achter elkaar. Die lege slide hoort te verdwijnen; de nummering slaat geen gat.

---

<!-- w4: white list -->

## 29. Lijst met labels

### 1.1

De kop van elk item wordt een klein label links. Bedoeld voor codes en afkortingen.

### 1.2

De tekst ernaast krijgt de ruimte.

### 2.1

Vanaf vijf items wordt de tekst automatisch een maat kleiner.

---

<!-- w4: blue agenda -->

## 30. Agenda

### Waar we vandaan komen

De nummers zet de builder erbij, jij niet.

### Wat er verandert

Anders dan bij `list` blijft de kop staan als titel van het item.

### Wat we van je vragen

Met een lijn tussen de items, zonder kaders.

---

<!-- w4: white timeline -->

## 31. Tijdlijn

### Q1

Vier stappen naast elkaar op een doorlopende lijn.

### Q2

Het aantal maakt niet uit; de lijn loopt door.

### Q3

De punten staan in de accentkleur.

### Q4

Klaar.

---

<!-- w4: aubergine kpi -->

## 32. Cijfers

### 4

Gemeenten die samen uitvoeren.

### 1,4 mln

Inwoners die ervan afhangen.

### 99,9%

Beschikbaarheid waar we op mikken.

---

<!-- w4: white contrast -->

## 33. Contrast

### Output

> We hebben 21 rapportages opgeleverd.

Meten wat je gedaan hebt.

### Outcome

> Een aanvraag duurt nog 10 dagen in plaats van 21.

Meten wat er veranderd is. De volgorde draagt de betekenis: eerst wat je achter je laat.

---

<!-- w4: white before-after -->

## 34. Voor en na

### Zoals het was

~~Elk kwartaal een rapportage die niemand leest.~~

***

### Zoals het wordt

Elk kwartaal een gesprek over wat er echt veranderd is.

- Minder papier
- Meer richting

---

<!-- w4: grey stacked -->

## 35. Gestapeld

### Doel

Dezelfde gedachte als before-after, maar verticaal.

***

### Sleutelresultaat

Handig als de kaarten meer tekst hebben dan naast elkaar past.

---

<!-- w4: white table -->

## 36. Tabel

| Kwartaal | Doel | Stand |
| --- | --- | --- |
| Q1 | 10 dagen | 14 |
| Q2 | 10 dagen | 12 |
| Q3 | 10 dagen | 10 |
| Q4 | 8 dagen | - |

---

<!-- w4: green section ghost:02 -->

## 37. Sectie-tussenschot

Grote titel met een streep in de accentkleur, plus een ghost-nummer op de achtergrond.

---

<!-- w4: photo -->

![](img/photos/woman-sticking-note-to-wall.jpg)

## 38. Foto

De foto vult de slide, de tekst staat onderaan met een verloop erachter.

---

<!-- w4: blue accent:pink eyebrow:"Losse onderdelen" ghost:39 -->

## 39. Accent, eyebrow en ghost

Deze slide is blauw, maar het accent is roze: kijk naar het eyebrow-label hierboven. Rechtsonder staat het ghost-nummer.

- Accent staat los van de achtergrondkleur
- Eyebrow en ghost werken op elke layout

---

<!-- w4: green icon:"Game Boy" -->

## 40. Icoon met een spatie

`icon:"Game Boy"` tussen quotes. Zonder quotes splitst de tokenregel op de spatie en zoekt de builder naar een icoon dat `Game` heet.

---

<!-- w4: green end -->

# Einde

Geen footer, geen slidenummer, diapositief logo. Net als de cover.
