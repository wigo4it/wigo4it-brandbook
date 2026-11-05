---
name: wigo4it-huisstijl
description: >
  Maakt presentaties en documenten in de Wigo4it-huisstijl. Schrijft een markdown-bestand dat
  je in de brandbook-tools (slide-deck of PDF) sleept en dat er meteen goed uitziet: de juiste
  kleuren, layouts, iconen en vormen. Gebruik deze skill zodra iemand vraagt om een presentatie,
  slide-deck, deck, praatplaat, PowerPoint-vervanger, memo, notitie, rapport, jaarplan, whitepaper,
  handleiding of ander document voor Wigo4it, of het in de huisstijl wil hebben, of vraagt om iets
  "in ons format", "in de brandbook-stijl" of "met onze sjablonen". Trigger ook bij vragen over
  de deck-syntax, de w4-tokens, welke layout of welke merkkleur je moet gebruiken, en bij vragen
  naar de beschikbare iconen, vormen en foto's uit de brandbook-assets.
---

# Wigo4it-huisstijl

Je maakt hier één ding: een markdown-bestand dat de gebruiker in een brandbook-tool sleept.
De opmaak zit in de tool, niet in het bestand. Jij levert de inhoud plus, bij een presentatie,
een paar tokens die kleur en layout bepalen.

De tools staan op https://wigo4it.github.io/wigo4it-brandbook/

| Wat de gebruiker wil | Tool | Wat jij maakt |
| --- | --- | --- |
| Presentatie, deck, slides, praatplaat | [deck.html](https://wigo4it.github.io/wigo4it-brandbook/deck.html) | markdown met `<!-- w4: ... -->`-tokens |
| Document, memo, rapport, notitie, plan, handleiding | [pdf.html](https://wigo4it.github.io/wigo4it-brandbook/pdf.html) | gewone markdown, zonder tokens |

Twijfel je? Vraag het in één zin. "Wordt dit iets om te presenteren of om te lezen?"

## Vaste regels

1. **Alles in het Nederlands.** De tekst in het bestand, je uitleg eromheen, de bestandsnaam.
2. **Roep de skill `anti-slop-nl` aan** voordat je de tekst oplevert. Elke zin die in een deck of
   document terechtkomt gaat daar eerst langs. Geen "cruciaal", geen "landschap", geen em-dashes,
   geen opsommingen van drie bijvoeglijke naamwoorden.
3. **Verzin geen kleuren, iconen of vormen.** Alleen wat in `references/assets.md` staat. Een
   `icon:Raket` bestaat niet, `icon:Rocket` wel.
4. **Verzin geen inhoud die je niet hebt.** Geen cijfers, geen citaten, geen namen. Weet je een
   getal niet, zet er `[cijfer invullen]` neer en noem het bij de oplevering.
5. **Schrijf het bestand weg als `.md`** en zeg er daarna in gewone taal bij wat de gebruiker
   moet doen. Zie "Oplevering" onderaan.

## Presentatie maken

**Stap 1. Vraag maximaal drie dingen.** Meer niet, dit moet snel gaan.
- Waar gaat het over, en wat moet er blijven hangen?
- Voor wie, en hoe lang duurt het?
- Is er materiaal (een notitie, een jaarplan, een mail) dat erin moet?

Krijg je geen antwoord of zegt de gebruiker "verzin maar wat", maak dan een eerste versie op basis
van wat je hebt en zeg erbij wat je hebt ingevuld.

**Stap 2. Bepaal de opbouw voordat je schrijft.** Reken op ongeveer één slide per minuut spreektijd.
Een bruikbaar skelet:

```
cover  ->  agenda  ->  section  ->  inhoud (3-6 slides)  ->  statement  ->  end
```

Kies per slide een layout op basis van wat de inhoud is, niet op basis van afwisseling.
De keuzehulp staat in `references/deck-layouts.md`: daar staat per layout wanneer je 'm pakt,
plus een blok markdown dat je kunt overnemen.

**Stap 3. Schrijf de markdown.** Het volledige formaat staat in `references/deck-syntax.md`.
De kern:

```markdown
---
title: Van output naar outcome
footer: Wigo4it - jaarplan 2026
---

<!-- w4: cover shape:ring@topright icon:Rocket -->

# Van output naar outcome

Waar we heen bewegen, en wat dat van ons vraagt.

Note: Welkom, dit ziet alleen de spreker.

---

<!-- w4: blue agenda -->

## Wat komt er langs

### Waar we vandaan komen

De doelen zoals ze nu op papier staan.

### Wat er verandert

Van opleveren naar resultaat.
```

Vuistregels voor de tekst op een slide:
- Eén gedachte per slide. Past het niet, splits het.
- Maximaal ongeveer 30 woorden zichtbaar. De rest zet je achter `Note:` als sprekersnotitie.
- Schrijf sprekersnotities bij elke inhoudelijke slide. Daar staat het verhaal, op de slide staat de kapstok.
- Geen zin die op de slide staat en ook uitgesproken wordt. Dat leest het publiek sneller dan jij praat.

**Stap 4. Controleer.** Draai:

```bash
python scripts/check_deck.py <bestand.md>
```

Het script kijkt de tokens, layouts, kleuren en asset-namen na en klaagt over slides met te veel
tekst. Los alles op wat het meldt voordat je oplevert. Geen Python beschikbaar? Loop dan
`references/deck-syntax.md` handmatig na, met extra aandacht voor de namen achter `shape:` en `icon:`.

## Document maken

Hier is bijna niets te leren: het is gewone markdown. De opmaak (voorblad, kleur, inhoudsopgave,
footer) zet de gebruiker in het paneel van de tool. Het volledige verhaal staat in
`references/pdf-syntax.md`.

Wat je wel moet weten:
- De eerste `#` is de documenttitel. Alles wat daarvóór staat, zoals een versietabel, wordt voorwerk
  op een eigen pagina.
- `##` komt in de inhoudsopgave, `###` en dieper niet. Bouw je koppenstructuur daar naar.
- `<!-- pagebreak -->` op een eigen regel dwingt een nieuwe pagina af. Zet er een voor elk nieuw
  hoofdstuk in een langer document.
- Tabellen, lijsten, links, vet en cursief werken gewoon. Verzin geen HTML.

Begin bij `templates/document-start.md` en gooi eruit wat niet nodig is.

Schrijfstijl in documenten: korte alinea's van drie tot vijf zinnen, een kop boven elk onderwerp,
en een tabel zodra je meer dan drie dingen naast elkaar zet. Daarna langs `anti-slop-nl`.

## Oplevering

Sluit altijd af met een instructie die iemand zonder technische kennis kan volgen. Pas de naam
van het bestand aan, verder is dit de tekst:

> Het bestand staat klaar als `jaarplan-2026.md`.
>
> 1. Ga naar https://wigo4it.github.io/wigo4it-brandbook/deck.html
> 2. Sleep het bestand op het grijze vlak links.
> 3. Je ziet meteen de preview. Klik "Presenteer" voor de volledige presentatie, of
>    "Deck downloaden als HTML" als je 'm wilt mailen of ergens neerzetten.
>
> Wil je iets veranderen: zeg het hier, dan pas ik het bestand aan. Zelf sleutelen kan ook,
> het is gewone tekst.

Voor een document is stap 1 https://wigo4it.github.io/wigo4it-brandbook/pdf.html en stap 3:
kies voorblad, titel en footer in het paneel, klik "Exporteer naar PDF", kies in het printvenster
"Opslaan als PDF" en zet **Achtergrondafbeeldingen** aan. Zonder dat vinkje print het voorblad wit.

## Wat waar staat

| Bestand | Waarvoor |
| --- | --- |
| `references/deck-syntax.md` | Het volledige auteursformaat: scheidingstekens, tokens, frontmatter |
| `references/deck-layouts.md` | Alle 17 layouts, inclusief `canvas` voor bestaande slides |
| `references/pdf-syntax.md` | Markdown-regels en de instellingen van de PDF-tool |
| `references/huisstijl.md` | Kleuren, fonts, kleurgebruik per slide, logo en toon |
| `references/assets.md` | Alle iconen, vormen, foto's en logo's met hun exacte naam |
| `templates/deck-start.md` | Werkend skelet voor een presentatie |
| `templates/document-start.md` | Werkend skelet voor een document |
| `scripts/check_deck.py` | Controleert een deck-bestand voor je 'm oplevert |
