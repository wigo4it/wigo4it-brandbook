# Nederland met de vier grote gemeenten

`nederland-g4.svg` is een bewerkte versie van
[Netherlands location map.svg](https://commons.wikimedia.org/wiki/File:Netherlands_location_map.svg)
van **Lencer en Wikimedia-bijdragers**, onder anderen NordNordWest, Io Herodotus en Thayts.
De gedownloade versie dateert van 5 januari 2019. Geraadpleegd op 5 november 2026.

Bron en bewerkte SVG vallen onder **[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)**.
Deze licentie geldt voor de kaart, niet voor de overige Wigo4it-assets.

## Aanpassingen

Alleen de Nederlandse landvormen en provinciegrenzen zijn behouden. Zee, buurlanden,
rivieren en editorgegevens zijn weggelaten. De kaart heeft de Wigo4it-kleuren:
lichtgrijs land, donkergroene contouren en blauwe stadsmarkeringen met een witte rand.
De SVG bevat uitsluitend vectorgeometrie, geen ingebedde PNG.

De vier stippen gebruiken benaderde stadscentra in WGS84:

| Gemeente | Breedtegraad | Lengtegraad |
| --- | --- | --- |
| Amsterdam | 52.3676 | 4.9041 |
| Rotterdam | 51.9244 | 4.4777 |
| Den Haag | 52.0705 | 4.3007 |
| Utrecht | 52.0907 | 5.1214 |

De bron beschrijft een equirectangulaire projectie met grenzen 3.1° tot 7.5° oosterlengte
en 50.6° tot 53.7° noorderbreedte. Daarmee zijn de posities berekend.

De ongewijzigde bron staat in `sources/netherlands-location-map.svg`.
Opnieuw genereren: `python scripts/build-netherlands-map.py` vanuit de repo-root.
