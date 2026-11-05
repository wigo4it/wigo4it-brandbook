# Skill: wigo4it-huisstijl

Deze map is een Claude-skill. Hij laat Claude presentaties en documenten schrijven die je in de
brandbook-tools sleept en die er meteen goed uitzien.

Dit bestand is voor de beheerder. Wie de skill gebruikt, hoeft hier niets van te weten: die vraagt
gewoon om een presentatie of een document en krijgt aan het eind een instructie in gewone taal.

## Wat erin zit

```
SKILL.md                       instructies voor Claude, plus de workflow
references/deck-syntax.md      het auteursformaat van een deck
references/deck-layouts.md     alle 17 layouts met voorbeelden
references/pdf-syntax.md       de markdown-regels voor een document
references/huisstijl.md        kleuren, fonts, kleurgebruik, toon
references/assets.md           alle iconen, vormen, foto's en logo's
references/assets.json         dezelfde namen, machineleesbaar, voor het script
templates/deck-start.md        werkend skelet voor een presentatie
templates/document-start.md    werkend skelet voor een document
scripts/check_deck.py          controleert een deck voordat het opgeleverd wordt
```

## Uitrollen

**Claude.ai (org-breed).** Zip de map `wigo4it-huisstijl` en upload 'm bij Settings > Capabilities >
Skills. De beheerder kan de skill daar voor de hele organisatie aanzetten.

**Claude Code (per gebruiker).** Kopieer de map naar `~/.claude/skills/wigo4it-huisstijl/`.

**Claude Code (per project).** Kopieer de map naar `.claude/skills/wigo4it-huisstijl/` in de repo.

De skill hangt samen met `anti-slop-nl`. Die staat er los van en moet ook uitgerold zijn, anders
mist Claude de controle op AI-taal.

## Onderhoud

Verandert er iets aan het deck-formaat, de tools of de merkkleuren, dan lopen deze bestanden mee
achteraan aan:

| Verandert er iets aan | Werk dan bij |
| --- | --- |
| Tokens of layouts in `scripts/deck-builder.js` | `references/deck-syntax.md`, `references/deck-layouts.md`, de lijsten bovenin `scripts/check_deck.py` |
| De templates in `scripts/deck-templates.js` | `references/deck-layouts.md` |
| Merkkleuren in `styles/w4.css` | `references/huisstijl.md` |
| Bestanden in `img/` | `references/assets.md` en `references/assets.json` |
| De instellingen in `pdf.html` | `references/pdf-syntax.md` |

`references/assets.json` regenereren vanuit de repo-root:

```bash
python -c "
import json
d = json.load(open('assets.json', encoding='utf-8'))
out = {k: d[k] for k in ('brand', 'version', 'baseUrl', 'generated')}
out['names'] = {
    c['id']: sorted({a['file'].rsplit('.', 1)[0] for a in c['assets']}, key=str.lower)
    for c in d['categories']
}
open('skills/wigo4it-huisstijl/references/assets.json', 'w', encoding='utf-8').write(
    json.dumps(out, ensure_ascii=False, indent=2) + '\n')
"
```

Het controlescript haalt de namenlijst bij voorkeur live van
https://wigo4it.github.io/wigo4it-brandbook/assets.json en valt terug op de kopie hierboven. Die
kopie hoeft dus alleen bij te blijven voor omgevingen zonder internettoegang.

## Testen

```bash
python skills/wigo4it-huisstijl/scripts/check_deck.py examples/deck-test.md --stil
```

`examples/deck-test.md` bevat expres een aantal fouten (een `split` zonder `***`, een `columns`
zonder items, `shape:rng`, `icon:Zonn`, onbekende tokens). Meldt het script die niet meer, dan is
er iets stuk.
