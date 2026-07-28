/* ============================================================
   Slide-templates: de galerij

   Elke template staat hier een keer, als markdown. De pagina rendert dat
   met dezelfde buildSlide() als de echte tool, dus wat je hier ziet kan
   per definitie niet uit de pas lopen met wat je krijgt.

   Reveal.js draait hier niet: we hebben alleen de opmaak nodig, geen
   navigatie of overgangen. De slide wordt op ware grootte (1600x900)
   opgebouwd en met een transform teruggeschaald naar de kaartbreedte.
   ============================================================ */
import { buildSlide } from './deck-builder.js';

const SLIDE_W = 1600;

/**
 * De templates. `md` is precies wat je in je eigen bestand plakt, inclusief
 * de tokenregel, zodat de kopieerknop iets bruikbaars oplevert.
 */
export const TEMPLATES = [
  {
    name: 'cover',
    group: 'Begin en eind',
    about: 'Openingsslide. Standaard groen, zonder footer, met het logo linksonder.',
    md: `<!-- w4: cover shape:ring@topright icon:Rocket -->

# Van output naar outcome

Een deck dat laat zien waar we heen bewegen.`,
  },
  {
    name: 'section',
    group: 'Begin en eind',
    about: 'Tussenschot tussen twee delen. Grote titel met een streep in de accentkleur.',
    md: `<!-- w4: green section ghost:02 -->

## Wat er verandert

Het tweede deel van het verhaal begint hier.`,
  },
  {
    name: 'end',
    group: 'Begin en eind',
    about: 'Afsluiter. Gecentreerd, zonder footer, logo onderaan in het midden.',
    md: `<!-- w4: green end -->

# Dank

Vragen? Stel ze nu, of later bij het koffieapparaat.`,
  },
  {
    name: 'statement',
    group: 'Eén gedachte',
    about: 'Grote kop, weinig tekst, veel kleur. Voor het punt dat moet blijven hangen.',
    md: `<!-- w4: green statement -->

## Een statement krijgt de ruimte

Grote kop, weinig tekst, veel kleur.`,
  },
  {
    name: 'quote',
    group: 'Eén gedachte',
    about: 'Citaat met de bron eronder. De regel na het citaat wordt kleiner gezet.',
    md: `<!-- w4: yellow quote -->

> Zeg het in een zin, dan onthoudt iemand het ook.

Iemand op een maandagochtend`,
  },
  {
    name: 'photo',
    group: 'Eén gedachte',
    about:
      'De foto vult de slide, de tekst staat onderaan met een verloop erachter. ' +
      'De eerste afbeelding in de slide wordt gebruikt.',
    md: `<!-- w4: photo -->

![](img/photos/woman-sticking-note-to-wall.jpg)

## Doelen op de muur

Waar we het over hebben als we het over resultaat hebben.`,
  },
  {
    name: 'split',
    group: 'Twee helften',
    about: 'Twee kolommen naast elkaar, gescheiden door `***`. Links verhaal, rechts bewijs.',
    md: `<!-- w4: white split -->

## Split-layout

Links het verhaal, rechts het bewijs.

***

### In cijfers

- 4 gemeenten
- 1 gedeelde uitvoering
- 0 excuses voor slechte software`,
  },
  {
    name: 'before-after',
    group: 'Twee helften',
    about:
      'Twee kaarten met een pijl ertussen. Doorgestreepte tekst (`~~zo~~`) krijgt de rode streep.',
    md: `<!-- w4: white before-after accent:green -->

### Zoals het was

~~Elk kwartaal een rapportage die niemand leest.~~

***

### Zoals het wordt

Elk kwartaal een gesprek over wat er echt veranderd is.

1. Minder papier
2. Meer richting`,
  },
  {
    name: 'stacked',
    group: 'Twee helften',
    about: 'Dezelfde gedachte als before-after, maar verticaal. Handig bij meer tekst per kaart.',
    md: `<!-- w4: grey stacked accent:pink -->

## Van meten naar merken

### Wat we vaak meten

**60% aangesloten.** Beweegt snel, maar bewijst geen waarde.

***

### Wat we willen zien

**Minder fouten en minder hersteltijd.** Bewijst dat het echt werk wegneemt.`,
  },
  {
    name: 'columns',
    group: 'Meerdere items',
    about: 'Items als kaarten naast elkaar. Twee tot vier werkt het best.',
    md: `<!-- w4: blue columns -->

## Waar we voor staan

### Betrouwbaar

Het werkt, elke dag, voor iedereen die ervan afhankelijk is.

### Innovatief

Nieuwe techniek waar het helpt, niet waar het leuk staat.

### Samen

Vier gemeenten, een team, een richting.`,
  },
  {
    name: 'list',
    group: 'Meerdere items',
    about: 'Items onder elkaar, de kop wordt een klein label ervoor. Voor codes en afkortingen.',
    md: `<!-- w4: white list accent:red -->

## Onze doelen zijn opleveringen

### 1.1

De Participatiewet in Balans wordt vanuit Socrates ondersteund.

### 3.1

IKV is multitenant voor de G4.

### 5.1

De coöperatie kan Common Ground applicaties uitrollen.`,
  },
  {
    name: 'agenda',
    group: 'Meerdere items',
    about: 'Items onder elkaar met doorlopende nummers. Die zet de builder erbij, jij niet.',
    md: `<!-- w4: blue agenda -->

## Wat komt er langs?

### Waar we vandaan komen

De doelen zoals ze nu in het jaarplan staan.

### Wat er verandert

Van opleveringen naar resultaat.

### Wat we van je vragen

Eén vraag bij elk doel.`,
  },
  {
    name: 'timeline',
    group: 'Meerdere items',
    about: 'Items op een doorlopende lijn met een punt per stap. Twee tot vijf stappen.',
    md: `<!-- w4: white timeline -->

## Wanneer wat

### Q1

Doelen herschrijven met de teams.

### Q2

Eerste meting, nulpunt vastleggen.

### Q3

Bijsturen waar het niet beweegt.

### Q4

Terugkijken op wat er echt veranderd is.`,
  },
  {
    name: 'kpi',
    group: 'Meerdere items',
    about: 'De kop van elk item wordt het grote cijfer, de tekst eronder het bijschrift.',
    md: `<!-- w4: aubergine kpi -->

## In cijfers

### 4

Gemeenten die samen uitvoeren.

### 1,4 mln

Inwoners die ervan afhangen.

### 99,9%

Beschikbaarheid waar we op mikken.`,
  },
  {
    name: 'contrast',
    group: 'Meerdere items',
    about:
      'Kaarten met een gekleurd label. Het eerste item is de kant die je verlaat en wordt rood, ' +
      'de rest groen. Die volgorde is de hele betekenis van de layout.',
    md: `<!-- w4: white contrast accent:blue -->

## "Af" is niet hetzelfde als beter

### Output

"We bouwen een nieuwe aanvraagmodule."

Kan compleet af zijn zonder dat iemand er iets van merkt.

### Outcome

Doorlooptijd van een aanvraag daalt van 21 naar 10 dagen.

Beïnvloedbaar, niet afdwingbaar.`,
  },
  {
    name: 'table',
    group: 'Meerdere items',
    about: 'Tabel over de volle breedte, met een accentlijn onder de kop.',
    md: `<!-- w4: white table -->

## Stand van zaken

| Kwartaal | Doel | Stand |
| --- | --- | --- |
| Q1 | 10 dagen | 14 |
| Q2 | 10 dagen | 12 |
| Q3 | 10 dagen | 10 |`,
  },
  {
    name: 'steps',
    group: 'Losse onderdelen',
    about:
      'Geen layout maar een token: lijstitems verschijnen een voor een. Werkt op elke layout ' +
      'met een lijst erin.',
    md: `<!-- w4: aubergine steps icon:Koffie -->

## Stap voor stap

- Eerst dit
- Dan dit
- En dan pas de conclusie`,
  },
  {
    name: 'accent, eyebrow en ghost',
    group: 'Losse onderdelen',
    about:
      'Drie tokens die op elke layout werken. Het accent kleurt badges en lijnen los van de ' +
      'achtergrond, de eyebrow zet een label boven de titel, de ghost een groot cijfer erachter.',
    md: `<!-- w4: blue accent:pink eyebrow:"Losse onderdelen" ghost:07 -->

## Drie tokens die overal werken

Het accent staat los van de achtergrondkleur, zodat je met één woord de hele slide omkleurt.`,
  },
];

/** Kort hulpje: element met class en tekst. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Bouw de slide op ware grootte en zet 'm in een geschaalde bak. De schaal
 * volgt de breedte van de kaart, zodat de galerij meebeweegt met het scherm.
 */
function stageFor(markdown, renderMarkdown) {
  const section = buildSlide({
    markdown,
    renderMarkdown,
    number: 1,
    footerText: 'Wigo4it',
  });
  section.style.background = section.dataset.backgroundColor;

  const slides = el('div', 'slides');
  slides.append(section);
  const reveal = el('div', 'reveal');
  reveal.append(slides);

  const stage = el('div', 'w4-tpl-stage');
  stage.setAttribute('aria-hidden', 'true');
  stage.append(reveal);
  return stage;
}

/** Kopieerknop met een korte bevestiging, zoals op de icoon- en vormpagina's. */
function copyButton(text) {
  const button = el('button', 'w4-tool-btn is-secondary w4-tpl-copy', 'Kopieer markdown');
  button.type = 'button';
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Gekopieerd';
    } catch {
      button.textContent = 'Kopiëren lukte niet';
    }
    setTimeout(() => {
      button.textContent = 'Kopieer markdown';
    }, 1600);
  });
  return button;
}

function card(template, renderMarkdown) {
  const article = el('article', 'w4-tpl');
  article.id = `tpl-${template.name.replace(/[^a-z-]/g, '')}`;
  article.dataset.search = `${template.name} ${template.group} ${template.about}`.toLowerCase();

  const info = el('div', 'w4-tpl-info');
  const head = el('div', 'w4-tpl-head');
  head.append(el('h3', null, template.name), el('span', 'w4-tpl-group', template.group));

  const code = el('code', null, template.md);
  const pre = el('pre', 'w4-tpl-code');
  pre.append(code);

  info.append(head, el('p', 'w4-tpl-about', template.about), pre, copyButton(template.md));
  article.append(stageFor(template.md, renderMarkdown), info);
  return article;
}

/** Schaal elke slide-bak naar de breedte die hij gekregen heeft. */
function fitStages() {
  for (const stage of document.querySelectorAll('.w4-tpl-stage')) {
    stage.style.setProperty('--tpl-scale', stage.clientWidth / SLIDE_W);
  }
}

function main() {
  const md = window.markdownit({ html: true, breaks: false, linkify: true });
  const renderMarkdown = (text) => md.render(text);

  const grid = document.getElementById('tpl-grid');
  for (const template of TEMPLATES) grid.append(card(template, renderMarkdown));

  fitStages();
  new ResizeObserver(fitStages).observe(grid);

  const search = document.getElementById('tpl-search');
  const count = document.getElementById('tpl-count');
  const filter = () => {
    const term = search.value.trim().toLowerCase();
    let shown = 0;
    for (const article of grid.children) {
      const hit = !term || article.dataset.search.includes(term);
      article.hidden = !hit;
      if (hit) shown += 1;
    }
    count.textContent = `${shown} van ${TEMPLATES.length}`;
  };
  search.addEventListener('input', filter);
  filter();
}

if (window.markdownit) main();
else window.addEventListener('load', main);
