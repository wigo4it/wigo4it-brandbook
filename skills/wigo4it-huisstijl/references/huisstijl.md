# Huisstijl

Het volledige brandbook staat op https://wigo4it-brandbook.azurewebsites.net/

## Kleuren

| Naam | Hex | Token in een deck |
| --- | --- | --- |
| dark-green | `#005351` | `green` |
| aubergine | `#362c46` | `aubergine` |
| dark-blue | `#434d8e` | `blue` |
| bright-pink | `#bb55a9` | `pink` |
| bright-red | `#f56e6d` | `red` |
| soft-yellow | `#e9eb86` | `yellow` |
| light-grey | `#cfd6cc` | `grey` |
| light-green | `#63cf92` | alleen in het brandbook, geen slide-kleur |

Groen, aubergine, blauw, roze en rood zijn donker: daar wordt de tekst wit en wisselt het logo naar
de diapositieve versie. Geel, grijs en wit zijn licht.

`light-green` is geen achtergrondkleur voor een slide. Het is een accentkleur in het bredere
brandbook, bijvoorbeeld in datavisualisatie.

### Kleur inzetten in een deck

Kleur is ritme, geen decoratie. Een deck waarin elke slide een andere kleur heeft, leest als een
kleurenwaaier en niemand ziet meer wat belangrijk is.

Werkende aanpak:
- **Groen** is de hoofdkleur. Cover, tussenschotten en de afsluiter.
- **Wit** is de werkkleur. Het merendeel van je inhoudelijke slides is wit.
- **Aubergine of blauw** voor een blok dat bij elkaar hoort, bijvoorbeeld alle cijfers.
- **Geel, roze of rood** voor precies één slide die eruit moet springen. Per deck één, hooguit twee.
- **Grijs** als je iets wilt laten zakken: een tussenstap, een zijpad.

Vuistregel: als je meer dan vier kleuren in één deck gebruikt, klopt er iets niet.

### Accent

Elke slide heeft een accentkleur die badges, cijfers, tijdlijnpunten en lijnen kleurt. Zonder
`accent:`-token kiest de achtergrondkleur er zelf een die leesbaar is: geel op alle donkere
kleuren, groen op geel, grijs en wit. Zet alleen een eigen accent als je een reden hebt, en houd
het dan hetzelfde binnen een blok slides dat bij elkaar hoort.

## Fonts

- **PP Neue Machina** voor koppen en display.
- **Raleway** voor lopende tekst en UI.

Die zitten in de tools. Je hoeft er niets voor te doen en je kunt ze niet wijzigen.

## Logo

Het logo staat automatisch op elke slide en op het voorblad van een document. Op donkere
achtergronden wisselt de tool naar de diapositieve versie. Zet zelf geen logo in je markdown.

Losse logobestanden voor ander gebruik staan in `assets.md`.

## Vormen en iconen

Vormen (`shape:`) zijn grote grafische vlakken in een hoek van de slide. Eén per slide, en niet op
elke slide: op de cover, op tussenschotten en op een statement staan ze goed, daarbuiten leiden ze
af.

Iconen (`icon:`) zijn klein en illustratief. De iconenset is speels (Pacman, Game Boy, Duckie).
Dat past bij Wigo4it, maar niet bij elk onderwerp. Kies een icoon dat ergens op slaat of laat 'm weg.

Volledige namenlijst: `assets.md`.

## Toon

Zoals een collega het bij het koffieapparaat uitlegt: direct, nuchter, zonder opsmuk.

- Korte zinnen. Varieer de lengte, anders leest het houterig.
- Actief, niet passief. "We schrappen de rapportage", niet "er zal worden overgegaan tot".
- Concreet boven abstract. Noem het getal, de datum, de naam.
- Droge humor mag. Uitroeptekens en superlatieven niet.
- Geen Engels waar Nederlands bestaat, behalve waar het jargon is onder engineers.
- Geen em-dashes.

Voor de volledige lijst met woorden en patronen die je vermijdt: roep de skill `anti-slop-nl` aan
voordat je iets oplevert. Dat is geen optie, dat hoort bij het werk.

## Datavisualisatie

Staat een grafiek in een deck of document, dan gaat die als afbeelding naar binnen; de tools maken
zelf geen grafieken. Houd je aan de merkkleuren en gebruik er niet meer dan vier in één grafiek.
De patronen staan op https://wigo4it-brandbook.azurewebsites.net/design-system.html
