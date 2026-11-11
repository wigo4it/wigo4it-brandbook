# Layouts: welke pak je wanneer

Zeventien layouts. Kies op wat de inhoud is, niet op afwisseling. De markdown-blokken hieronder zijn
letterlijk over te nemen; alleen de tekst vervang je.

Wil je zien hoe ze eruitzien:
https://wigo4it-brandbook.azurewebsites.net/deck-templates.html

## Snelkeuze

| Je hebt | Pak |
| --- | --- |
| Een openingsslide | `cover` |
| Een overzicht van wat er komt | `agenda` |
| Een tussenschot tussen twee delen | `section` |
| Eén gedachte die moet blijven hangen | `statement` |
| Een uitspraak van iemand | `quote` |
| Sfeer of een pauze in het verhaal | `photo` |
| Verhaal links, bewijs rechts | `split` |
| Drie of vier gelijkwaardige punten | `columns` |
| Een rij codes, doelen of afkortingen met uitleg | `list` |
| Iets dat in de tijd loopt | `timeline` |
| Twee tot vier getallen | `kpi` |
| Oud tegenover nieuw, met een pijl | `before-after` |
| Hetzelfde, maar met meer tekst per kant | `stacked` |
| Twee begrippen die mensen verwarren | `contrast` |
| Vier of meer rijen data | `table` |
| Een afsluiter | `end` |
| Een bestaande slide met vrij geplaatste tekst en illustraties | `canvas` |

Twijfel je tussen `columns` en `list`? Korte items naast elkaar is `columns`, een lijst met labels
ervoor is `list`.

## Begin en eind

### cover

Openingsslide. Standaard groen, zonder footer, met het logo linksonder.

```markdown
<!-- w4: cover shape:ring@topright icon:Rocket -->

# Van output naar outcome

Een deck dat laat zien waar we heen bewegen.
```

### section

Tussenschot tussen twee delen. Grote titel met een streep in de accentkleur. Zet er een `ghost:`
bij als je de delen nummert.

```markdown
<!-- w4: green section ghost:02 -->

## Wat er verandert

Het tweede deel van het verhaal begint hier.
```

### end

Afsluiter. Gecentreerd, zonder footer, logo onderaan in het midden.

```markdown
<!-- w4: green end -->

# Dank

Vragen? Stel ze nu, of later bij het koffieapparaat.
```

## Eén gedachte

### statement

Grote kop, weinig tekst, veel kleur. Voor het punt dat moet blijven hangen. Gebruik er twee of
drie in een deck, niet meer, anders is niets meer bijzonder.

```markdown
<!-- w4: green statement -->

## Een statement krijgt de ruimte

Grote kop, weinig tekst, veel kleur.
```

### quote

Citaat met de bron eronder. De regel na het citaat wordt kleiner gezet.

```markdown
<!-- w4: yellow quote -->

> Zeg het in een zin, dan onthoudt iemand het ook.

Iemand op een maandagochtend
```

### photo

De foto vult de slide, de tekst staat onderaan met een verloop erachter. De eerste afbeelding in
de slide wordt gebruikt. Namen van beschikbare foto's staan in `assets.md`.

```markdown
<!-- w4: photo -->

![](img/photos/woman-sticking-note-to-wall.jpg)

## Doelen op de muur

Waar we het over hebben als we het over resultaat hebben.
```

## Twee helften

### split

Twee kolommen naast elkaar, gescheiden door `***`. Links verhaal, rechts bewijs.

```markdown
<!-- w4: white split -->

## Split-layout

Links het verhaal, rechts het bewijs.

***

### In cijfers

- 4 gemeenten
- 1 gedeelde uitvoering
- 0 excuses voor slechte software
```

### before-after

Twee kaarten met een pijl ertussen. Doorgestreepte tekst (`~~zo~~`) krijgt de rode streep.

```markdown
<!-- w4: white before-after accent:green -->

### Zoals het was

~~Elk kwartaal een rapportage die niemand leest.~~

***

### Zoals het wordt

Elk kwartaal een gesprek over wat er echt veranderd is.

1. Minder papier
2. Meer richting
```

### stacked

Dezelfde gedachte als `before-after`, maar verticaal. Handig bij meer tekst per kaart.

```markdown
<!-- w4: grey stacked accent:pink -->

## Van meten naar merken

### Wat we vaak meten

**60% aangesloten.** Beweegt snel, maar bewijst geen waarde.

***

### Wat we willen zien

**Minder fouten en minder hersteltijd.** Bewijst dat het echt werk wegneemt.
```

## Meerdere items

Alle layouts hieronder knippen op `###`. Twee tot vier items werkt het best, vijf is het maximum.
Bij meer wordt de tekst te klein en kun je beter splitsen over twee slides.

### columns

Items als kaarten naast elkaar.

```markdown
<!-- w4: blue columns -->

## Waar we voor staan

### Betrouwbaar

Het werkt, elke dag, voor iedereen die ervan afhankelijk is.

### Innovatief

Nieuwe techniek waar het helpt, niet waar het leuk staat.

### Samen

Vier gemeenten, een team, een richting.
```

### list

Items onder elkaar, de kop wordt een klein label ervoor. Voor codes, doelnummers en afkortingen.

```markdown
<!-- w4: white list accent:red -->

## Onze doelen zijn opleveringen

### 1.1

De Participatiewet in Balans wordt vanuit Socrates ondersteund.

### 3.1

IKV is multitenant voor de G4.
```

### agenda

Items onder elkaar met doorlopende nummers. Die zet de tool erbij, jij niet. Nummer je koppen dus
niet zelf.

```markdown
<!-- w4: blue agenda -->

## Wat komt er langs

### Waar we vandaan komen

De doelen zoals ze nu in het jaarplan staan.

### Wat er verandert

Van opleveringen naar resultaat.

### Wat we van je vragen

Eén vraag bij elk doel.
```

### timeline

Items op een doorlopende lijn met een punt per stap. Twee tot vijf stappen. De kop is het moment,
de tekst wat er dan gebeurt.

```markdown
<!-- w4: white timeline -->

## Wanneer wat

### Q1

Doelen herschrijven met de teams.

### Q2

Eerste meting, nulpunt vastleggen.

### Q3

Bijsturen waar het niet beweegt.
```

### kpi

De kop van elk item wordt het grote cijfer, de tekst eronder het bijschrift. Houd de koppen kort:
`4`, `1,4 mln`, `99,9%`.

```markdown
<!-- w4: aubergine kpi -->

## In cijfers

### 4

Gemeenten die samen uitvoeren.

### 1,4 mln

Inwoners die ervan afhangen.

### 99,9%

Beschikbaarheid waar we op mikken.
```

### contrast

Kaarten met een gekleurd label. Het eerste item is de kant die je verlaat en wordt rood, de rest
groen. Die volgorde is de hele betekenis van de layout, dus zet het oude begrip eerst.

```markdown
<!-- w4: white contrast accent:blue -->

## "Af" is niet hetzelfde als beter

### Output

"We bouwen een nieuwe aanvraagmodule."

Kan compleet af zijn zonder dat iemand er iets van merkt.

### Outcome

Doorlooptijd van een aanvraag daalt van 21 naar 10 dagen.

Beïnvloedbaar, niet afdwingbaar.
```

### table

Tabel over de volle breedte, met een accentlijn onder de kop. Vier kolommen is het maximum dat
prettig leest op een beamer.

```markdown
<!-- w4: white table -->

## Stand van zaken

| Kwartaal | Doel | Stand |
| --- | --- | --- |
| Q1 | 10 dagen | 14 |
| Q2 | 10 dagen | 12 |
| Q3 | 10 dagen | 10 |
```

## Losse tokens

### steps

Geen layout maar een token: lijstitems verschijnen een voor een. Werkt op elke layout met een
lijst erin. Gebruik het als de volgorde iets betekent, niet als versiering.

```markdown
<!-- w4: aubergine steps icon:Koffie -->

## Stap voor stap

- Eerst dit
- Dan dit
- En dan pas de conclusie
```

### accent, eyebrow en ghost

Drie tokens die op elke layout werken.

```markdown
<!-- w4: blue accent:pink eyebrow:"Losse onderdelen" ghost:07 -->

## Drie tokens die overal werken

Het accent staat los van de achtergrondkleur, zodat je met één woord de hele slide omkleurt.
```
