/* ============================================================
   W4 Deck-builder
   Zet markdown om in een reveal.js-slidestructuur in de huisstijl.
   Pure logica, los te testen: de markdown -> HTML stap komt als
   callback binnen (markdown-it in de browser), de DOM-globals worden
   pas bij aanroep gebruikt en niet bij het laden van de module.

   Auteursformaat (zie deck.html voor de uitleg):
     ---            slide-einde
     --             verticale slide (verdieping onder de vorige)
     ***            kolomscheiding binnen een split-slide
     <!-- w4: ... --> opmaak-tokens voor die ene slide
     Note:          alles daarna is sprekersnotitie
   ============================================================ */
import { suggest } from './assets.js';

/* ── Wat de tool, de presentatieweergave en de export delen ──
   Deze drie draaien hetzelfde deck en moeten het dus eens zijn over waar de
   markdown staat en hoe reveal wordt opgestart. Stonden ze per bestand, dan
   loopt de export op den duur uit de pas met de preview en zie je dat pas op
   de beamer. Zelfde reden als bij fitDecoration, die de export via toString()
   meeschrijft in plaats van een tweede kopie te zijn. */

/** localStorage-sleutel met de markdown van het laatste deck. */
export const STORAGE_SOURCE = 'w4-deck-source';

/** localStorage-sleutel met de opties uit het instellingenpaneel. */
export const STORAGE_OPTIONS = 'w4-deck-options';

/** Het deck dat de tool laat zien zolang je zelf niets hebt geladen. */
export const EXAMPLE_DECK = 'examples/deck-voorbeeld.md';

/** markdown-it-opties. `html` staat aan omdat de tokens comments zijn. */
export const MARKDOWN_OPTIONS = { html: true, linkify: true, typographer: true };

/**
 * De reveal-instellingen die niet van een keuze afhangen. 1600x900 is de
 * slide-maat waar styles/deck.css op is ontworpen; `center: false` omdat elke
 * slide de volle hoogte vult. Transitie en plugins komen er per aanroep bij.
 */
export const REVEAL_BASE = {
  width: 1600,
  height: 900,
  margin: 0,
  center: false,
  hash: false,
};

/**
 * Kleurtokens -> huisstijlkleur. De waarde is bewust een CSS-variabele en
 * geen hex: de bron van waarheid blijft styles/w4.css, zodat een kleurwijziging
 * daar niet stilletjes langs de decks heen loopt.
 * `dark` bepaalt of het diapositieve logo en witte tekst nodig zijn.
 */
export const SLIDE_COLORS = {
  green: { color: 'var(--dark-green)', dark: true },
  aubergine: { color: 'var(--aubergine)', dark: true },
  blue: { color: 'var(--dark-blue)', dark: true },
  pink: { color: 'var(--bright-pink)', dark: true },
  red: { color: 'var(--bright-red)', dark: true },
  yellow: { color: 'var(--soft-yellow)', dark: false },
  grey: { color: 'var(--light-grey)', dark: false },
  white: { color: '#ffffff', dark: false },
};

/**
 * Accentkleur per achtergrondkleur. Het accent kleurt de kleine dingen die
 * structuur aanbrengen: badges, stamps, tijdlijn-punten, KPI-cijfers, lijnen.
 * Een slide zet er met `accent:naam` een andere voor in de plaats; de rest van
 * de opmaak leest altijd `--slide-accent` en hoeft dus niets van kleur te weten.
 */
const DEFAULT_ACCENTS = {
  green: 'yellow',
  aubergine: 'yellow',
  blue: 'yellow',
  pink: 'yellow',
  red: 'yellow',
  yellow: 'green',
  grey: 'green',
  white: 'green',
};

/**
 * Layouts die de builder structureel anders opbouwt.
 *
 * Eén conventie loopt door alle meervoudige layouts heen: **een `###`-kop start
 * een item**. Wat ervoor staat (meestal de slidetitel) blijft bovenaan staan.
 * De layout bepaalt alleen hoe die items neergezet worden, niet hoe je ze
 * opschrijft. Layouts met precies twee helften (`split`, `before-after`,
 * `stacked`) knippen op `***` in plaats daarvan.
 */
export const SLIDE_LAYOUTS = [
  // Bestaand
  'cover',
  'statement',
  'split',
  'columns',
  'quote',
  'end',
  // Items onder elkaar
  'list',
  'agenda',
  // Items naast elkaar
  'timeline',
  'kpi',
  'contrast',
  // Twee helften met een connector ertussen
  'before-after',
  'stacked',
  // Losse vormen
  'table',
  'section',
  'photo',
];

/** Posities voor een decoratieve shape. */
const SHAPE_SPOTS = ['topright', 'topleft', 'bottomright', 'bottomleft'];

const DEFAULT_COLOR = 'white';

/**
 * Knip een tokenregel op in losse tokens. Waarden mogen tussen dubbele quotes
 * staan, zodat spaties erin blijven: `icon:"Game Boy"` of `eyebrow:"Onze aanpak"`.
 * Zonder die uitzondering zou elke naam met een spatie onbereikbaar zijn, en
 * vijf van de iconen in img/icons hebben er een.
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return String(text).match(/[A-Za-z][\w-]*:"[^"]*"|\S+/g) || [];
}

/** Splits een token in sleutel en waarde, met de quotes eraf. */
function splitToken(token) {
  const at = token.indexOf(':');
  if (at === -1) return { key: token, value: '' };
  const value = token.slice(at + 1).trim();
  const unquoted = /^"(.*)"$/.exec(value);
  return { key: token.slice(0, at), value: unquoted ? unquoted[1] : value };
}

/**
 * Splits de frontmatter (optioneel, bovenaan, tussen twee `---`-regels) van
 * de rest. Alleen platte `sleutel: waarde`-regels; genoeg voor deck-metadata
 * en niets om een YAML-parser voor binnen te halen.
 * @param {string} source
 * @returns {{meta: Record<string, string>, body: string}}
 */
export function parseFrontMatter(source) {
  const text = String(source).replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  if (lines[0].trim() !== '---') return { meta: {}, body: text };

  const end = lines.indexOf('---', 1);
  if (end === -1) return { meta: {}, body: text };

  const meta = {};
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (match) meta[match[1].toLowerCase()] = match[2].trim();
  }
  return { meta, body: lines.slice(end + 1).join('\n').replace(/^\n+/, '') };
}

/**
 * Splits de body in slides. `---` op een eigen regel begint een nieuwe
 * horizontale slide, `--` een verticale slide onder de vorige. Het resultaat
 * is een lijst met groepen: de eerste in elke groep is de horizontale slide.
 * Lege slides vallen weg, zodat een dubbele scheiding niets kapotmaakt.
 * @param {string} body
 * @returns {string[][]}
 */
export function splitSlides(body) {
  const groups = [];
  let group = [];
  let buffer = [];

  const flushSlide = () => {
    if (buffer.join('\n').trim()) group.push(buffer.join('\n').trim());
    buffer = [];
  };
  const flushGroup = () => {
    flushSlide();
    if (group.length) groups.push(group);
    group = [];
  };

  for (const line of String(body).replace(/\r\n?/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (/^-{3,}$/.test(trimmed)) flushGroup();
    else if (trimmed === '--') flushSlide();
    else buffer.push(line);
  }
  flushGroup();

  return groups;
}

/**
 * Haal de opmaak-tokens uit een slide. Een directive is een markdown-comment
 * op een eigen regel: `<!-- w4: green statement shape:ring@topleft -->`.
 * Meerdere directives in een slide worden samengevoegd; de regels zelf gaan
 * uit de markdown zodat er niets van in beeld komt.
 * @param {string} markdown
 * @returns {{tokens: string[], markdown: string}}
 */
export function extractDirectives(markdown) {
  const tokens = [];
  const kept = [];
  for (const line of String(markdown).split('\n')) {
    const match = /^\s*<!--\s*w4:\s*(.*?)\s*-->\s*$/.exec(line);
    if (match) tokens.push(...tokenize(match[1]));
    else kept.push(line);
  }
  return { tokens, markdown: kept.join('\n').trim() };
}

/**
 * Knip de sprekersnotitie eraf: een regel die met `Note:` begint en alles
 * daarna hoort bij de notities, niet bij de slide.
 * @param {string} markdown
 * @returns {{markdown: string, notes: string}}
 */
export function extractNotes(markdown) {
  const lines = String(markdown).split('\n');
  const start = lines.findIndex((line) => /^\s*Note:/i.test(line));
  if (start === -1) return { markdown: String(markdown).trim(), notes: '' };

  const first = lines[start].replace(/^\s*Note:\s?/i, '');
  const notes = [first, ...lines.slice(start + 1)].join('\n').trim();
  return { markdown: lines.slice(0, start).join('\n').trim(), notes };
}

/**
 * Vertaal de tokens naar een slide-configuratie. Onbekende tokens gooien we
 * niet weg maar geven we terug als `unknown`, zodat de UI een typefout kan
 * melden in plaats van 'm stil te negeren.
 * @param {string[]} tokens
 * @returns {{color: string, dark: boolean, accent: string, layout: string,
 *            transition: string, shape: string, shapeSpot: string, icon: string,
 *            ghost: string, eyebrow: string, steps: boolean, unknown: string[]}}
 */
export function slideConfig(tokens = []) {
  const config = {
    color: DEFAULT_COLOR,
    dark: SLIDE_COLORS[DEFAULT_COLOR].dark,
    accent: '',
    layout: '',
    transition: '',
    shape: '',
    shapeSpot: 'topright',
    icon: '',
    ghost: '',
    eyebrow: '',
    steps: false,
    unknown: [],
  };

  for (const raw of tokens) {
    const token = String(raw).trim();
    if (!token) continue;
    const { key, value } = splitToken(token);

    if (SLIDE_COLORS[token]) {
      config.color = token;
      config.dark = SLIDE_COLORS[token].dark;
    } else if (SLIDE_LAYOUTS.includes(token)) {
      config.layout = token;
    } else if (token === 'steps') {
      config.steps = true;
    } else if (key === 'accent' && SLIDE_COLORS[value]) {
      config.accent = value;
    } else if (key === 'shape' && value) {
      const [name, spot] = value.split('@');
      config.shape = name;
      if (SHAPE_SPOTS.includes(spot)) config.shapeSpot = spot;
    } else if (key === 'icon' && value) {
      config.icon = value;
    } else if (key === 'ghost' && value) {
      config.ghost = value;
    } else if (key === 'eyebrow' && value) {
      config.eyebrow = value;
    } else if (key === 'transition' && value) {
      config.transition = value;
    } else {
      config.unknown.push(token);
    }
  }

  // Een cover is standaard groen; wie 'm anders wil zet er zelf een kleur bij.
  if (config.layout === 'cover' && !tokens.some((t) => SLIDE_COLORS[t])) {
    config.color = 'green';
    config.dark = true;
  }
  // Een foto vult de hele slide; daar hoort altijd witte tekst en het
  // diapositieve logo bij, ongeacht welke achtergrondkleur eronder zit.
  if (config.layout === 'photo') config.dark = true;
  // Zonder expliciet accent kiest de achtergrondkleur er een die leesbaar is.
  if (!config.accent) config.accent = DEFAULT_ACCENTS[config.color];
  return config;
}

/**
 * Controleer de asset-verwijzingen van een slide tegen het manifest. Een
 * `shape:rng` levert nu een 404 op een plaatje dat niemand mist tot het op de
 * beamer staat; met de namen uit assets.json is die typefout aan te wijzen.
 *
 * De namenlijst komt van buiten binnen: de builder blijft zo pure logica en
 * hoeft niets op te halen. Zonder lijst (`{}`) valt de controle stil weg.
 *
 * @param {object} config             Resultaat van slideConfig.
 * @param {{shapes?: string[], icons?: string[]}} [assets] Namen zonder extensie.
 * @returns {{kind: string, value: string, suggestion: string}[]}
 */
export function assetIssues(config, assets = {}) {
  const issues = [];
  for (const [kind, names] of [['shape', assets.shapes], ['icon', assets.icons]]) {
    const value = config[kind];
    if (!value || !names || !names.length || names.includes(value)) continue;
    issues.push({ kind, value, suggestion: suggest(value, names) });
  }
  return issues;
}

/** Zet losse HTML om in kind-elementen, zonder wrapper-div in het resultaat. */
function htmlToNodes(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return Array.from(template.content.childNodes);
}

/** Pad naar een asset, met spaties netjes ge-escaped (`Game Boy.svg`). */
function assetUrl(base, path) {
  return base + path.split('/').map(encodeURIComponent).join('/');
}

/** Kort hulpje: element met class en kinderen in een keer. */
function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(Boolean));
  return node;
}

/** Tekst van een kop, voor gebruik in een badge of stamp. */
function headingText(node) {
  return node.textContent.trim();
}

/**
 * Knip de body in items op `###`-koppen. Alles voor de eerste `###` (in de
 * praktijk de slidetitel) komt terug als `before`.
 *
 * Dit is de gedeelde bouwsteen onder alle meervoudige layouts. Daardoor schrijf
 * je een tijdlijn, een agenda en een rij kaarten in exact dezelfde markdown en
 * bepaalt alleen het layout-token hoe het eruitziet.
 * @param {Element} body
 * @returns {{before: ChildNode[], items: {heading: Element, nodes: ChildNode[]}[]}}
 */
function collectItems(body) {
  const before = [];
  const items = [];
  let current = null;

  for (const node of Array.from(body.childNodes)) {
    if (node.nodeName === 'H3') {
      current = { heading: node, nodes: [] };
      items.push(current);
    } else if (current) {
      current.nodes.push(node);
    } else {
      before.push(node);
    }
  }
  return { before, items };
}

/**
 * Splits de body op de eerste `<hr>` (in markdown: `***`) in twee helften.
 * Geeft null terug als de scheiding ontbreekt, zodat de aanroeper de slide
 * ongemoeid kan laten in plaats van een halve layout te bouwen.
 * @param {Element} body
 */
function splitHalves(body) {
  const nodes = Array.from(body.childNodes);
  const divider = nodes.find((n) => n.nodeName === 'HR');
  if (!divider) return null;

  const at = nodes.indexOf(divider);
  divider.remove();
  return { left: nodes.slice(0, at), right: nodes.slice(at + 1) };
}

/**
 * Haal de inleiding los uit een rij nodes, zodat een layout die boven de
 * constructie kan zetten in plaats van 'm in de eerste kaart te stoppen.
 *
 * Dezelfde regel als bij `collectItems`: alles voor de eerste `###` is intro.
 * Staat er geen `###`, dan telt alleen een leidende `#`/`##` als titel, want de
 * rest is dan gewoon de inhoud van de kaart.
 */
function takeIntro(nodes) {
  const at = nodes.findIndex((n) => n.nodeName === 'H3');
  if (at !== -1) return { intro: nodes.slice(0, at), rest: nodes.slice(at) };

  const first = nodes.find((n) => n.nodeType === 1 || n.textContent.trim());
  if (first && (first.nodeName === 'H1' || first.nodeName === 'H2')) {
    return { intro: [first], rest: nodes.filter((n) => n !== first) };
  }
  return { intro: [], rest: nodes };
}

/** Zet een grid neer met het aantal items als data-attribuut voor de CSS. */
function itemGrid(className, count) {
  const grid = el('div', className);
  grid.dataset.count = String(count);
  return grid;
}

/**
 * Split-layout: alles voor de eerste `<hr>` wordt de linkerkolom, de rest de
 * rechter. Zonder `<hr>` (in markdown: `***`) blijft de slide zoals hij was.
 * @param {Element} body
 */
function applySplit(body) {
  const halves = splitHalves(body);
  if (!halves) return;

  body.replaceChildren(
    el(
      'div',
      'w4-slide-split',
      el('div', 'w4-slide-panel', ...halves.left),
      el('div', 'w4-slide-panel', ...halves.right)
    )
  );
}

/** Kolommen-layout: elk item wordt een kaart naast de andere. */
function applyColumns(body) {
  const { before, items } = collectItems(body);
  if (!items.length) return;

  const grid = itemGrid('w4-slide-cards', items.length);
  for (const item of items) {
    grid.append(el('article', 'w4-slide-card', item.heading, ...item.nodes));
  }
  body.replaceChildren(...before, grid);
}

/**
 * Lijst-layout: items onder elkaar, met de kop als klein label ervoor.
 * Bedoeld voor korte codes of afkortingen ("1.1", "KR2"); de tekst ernaast
 * krijgt de ruimte.
 */
function applyList(body) {
  const { before, items } = collectItems(body);
  if (!items.length) return;

  const list = itemGrid('w4-slide-list', items.length);
  for (const item of items) {
    const badge = el('span', 'w4-slide-badge');
    badge.textContent = headingText(item.heading);
    list.append(
      el('div', 'w4-slide-list-item', badge, el('div', 'w4-slide-list-text', ...item.nodes))
    );
  }
  body.replaceChildren(...before, list);
}

/**
 * Agenda-layout: items onder elkaar met een doorlopend nummer ervoor. De kop
 * blijft staan als titel van het item, want anders dan bij `list` is het
 * nummer niet iets wat je zelf verzint.
 */
function applyAgenda(body) {
  const { before, items } = collectItems(body);
  if (!items.length) return;

  const list = itemGrid('w4-slide-list is-agenda', items.length);
  items.forEach((item, index) => {
    const badge = el('span', 'w4-slide-badge is-number');
    badge.textContent = String(index + 1).padStart(2, '0');
    list.append(
      el(
        'div',
        'w4-slide-list-item',
        badge,
        el('div', 'w4-slide-list-text', item.heading, ...item.nodes)
      )
    );
  });
  body.replaceChildren(...before, list);
}

/** Tijdlijn: items naast elkaar op een doorlopende lijn met een punt per stap. */
function applyTimeline(body) {
  const { before, items } = collectItems(body);
  if (!items.length) return;

  const track = itemGrid('w4-slide-timeline', items.length);
  for (const item of items) {
    const dot = el('span', 'w4-slide-timeline-dot');
    dot.setAttribute('aria-hidden', 'true');
    track.append(el('div', 'w4-slide-timeline-step', dot, item.heading, ...item.nodes));
  }
  body.replaceChildren(...before, track);
}

/** KPI-rij: de kop van elk item wordt het grote cijfer, de tekst het bijschrift. */
function applyKpi(body) {
  const { before, items } = collectItems(body);
  if (!items.length) return;

  const row = itemGrid('w4-slide-kpis', items.length);
  for (const item of items) {
    const figure = el('p', 'w4-slide-kpi-figure');
    figure.textContent = headingText(item.heading);
    row.append(el('div', 'w4-slide-kpi', figure, el('div', 'w4-slide-kpi-label', ...item.nodes)));
  }
  body.replaceChildren(...before, row);
}

/**
 * Contrast-kaarten: de kop van elk item wordt een gekleurd stamp-label. Het
 * eerste item krijgt de "weg hiervan"-kleur, de rest de "hier naartoe"-kleur.
 * Die volgorde is de hele betekenis van de layout, dus zet het item dat je
 * afwijst vooraan.
 */
function applyContrast(body) {
  const { before, items } = collectItems(body);
  if (!items.length) return;

  const grid = itemGrid('w4-slide-cards is-contrast', items.length);
  items.forEach((item, index) => {
    const stamp = el('span', 'w4-slide-stamp');
    stamp.textContent = headingText(item.heading);
    grid.append(
      el('article', `w4-slide-card is-${index === 0 ? 'out' : 'in'}`, stamp, ...item.nodes)
    );
  });
  body.replaceChildren(...before, grid);
}

/**
 * Twee kaarten met een connector ertussen: de oude situatie, een pijl, de
 * nieuwe. Horizontaal bij `before-after`, verticaal bij `stacked`.
 * @param {Element} body
 * @param {{vertical?: boolean}} [options]
 */
function applyTransformation(body, { vertical = false } = {}) {
  const halves = splitHalves(body);
  if (!halves) return;

  const { intro, rest } = takeIntro(halves.left);
  const arrow = el('div', `w4-slide-arrow${vertical ? ' is-down' : ''}`);
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = vertical ? '↓' : '→';

  const grid = el(
    'div',
    vertical ? 'w4-slide-stacked' : 'w4-slide-before-after',
    el('article', 'w4-slide-card is-before', ...rest),
    arrow,
    el('article', 'w4-slide-card is-after', ...halves.right)
  );
  body.replaceChildren(...intro, grid);
}

/** Tabel-layout: de tabel krijgt de volle breedte in een eigen omhulsel. */
function applyTable(body) {
  const table = body.querySelector('table');
  if (!table) return;

  const wrap = el('div', 'w4-slide-table');
  table.replaceWith(wrap);
  wrap.append(table);
}

/**
 * Foto-layout: de eerste afbeelding wordt een laag over de hele slide, met een
 * tint in de accentkleur eroverheen zodat de tekst leesbaar blijft. Geeft de
 * laag terug zodat de aanroeper 'm achter de tekst kan hangen.
 * @param {Element} body
 * @returns {Element|null}
 */
function extractPhoto(body) {
  const img = body.querySelector('img');
  if (!img) return null;

  img.remove();
  img.classList.add('w4-slide-photo');
  img.setAttribute('aria-hidden', 'true');
  img.alt = '';
  return el('div', 'w4-slide-photo-layer', img, el('span', 'w4-slide-photo-tint'));
}

/**
 * Welke layout welke bewerking op de body doet. Layouts die hier niet in staan
 * (cover, statement, quote, end, section, photo) verschillen alleen in CSS en
 * hoeven de markdown niet te herschikken.
 */
const LAYOUT_RENDERERS = {
  split: applySplit,
  columns: applyColumns,
  list: applyList,
  agenda: applyAgenda,
  timeline: applyTimeline,
  kpi: applyKpi,
  contrast: applyContrast,
  table: applyTable,
  'before-after': (body) => applyTransformation(body),
  stacked: (body) => applyTransformation(body, { vertical: true }),
};

/** Laat lijstitems een voor een verschijnen (reveal-fragments). */
function applySteps(body) {
  for (const item of body.querySelectorAll('li')) {
    item.classList.add('fragment', 'fade-up');
  }
}

/**
 * Houd de decoratielaag gelijk aan wat je werkelijk ziet.
 *
 * Reveal schaalt de slide naar het venster en schildert de achtergrondkleur
 * over het hele scherm, ook over de balken die ontstaan als het venster een
 * andere verhouding heeft dan de slide (een 16:10 laptop, een half scherm).
 * Decoratie die op de sliderand wordt afgekapt hangt daardoor los in een vlak
 * dat gewoon doorloopt. Deze functie meet die overhang en zet 'm als CSS-
 * variabele, zodat de decoratielaag tot de echte beeldrand doorloopt en een
 * afgesneden shape altijd strak tegen de zijkant staat.
 *
 * Draait ook in het geëxporteerde HTML-bestand; deck-app.js schrijft de bron
 * van deze functie daarin mee, zodat er maar een versie van bestaat.
 * @param {object} reveal De reveal.js-instantie.
 */
export function fitDecoration(reveal) {
  const apply = () => {
    const root = document.querySelector('.reveal');
    if (!root) return;
    const scale = reveal.getScale() || 1;
    const { width, height } = reveal.getConfig();
    const x = Math.max(0, (window.innerWidth / scale - width) / 2);
    const y = Math.max(0, (window.innerHeight / scale - height) / 2);
    root.style.setProperty('--w4-overhang-x', `${Math.ceil(x)}px`);
    root.style.setProperty('--w4-overhang-y', `${Math.ceil(y)}px`);
  };

  apply();
  reveal.on('resize', apply);
  window.addEventListener('resize', apply);
}

/**
 * Decoratieve shape, icoon of ghost-nummer voor op de slide. Zit in een eigen
 * laag die tot de beeldrand doorloopt; zie fitDecoration.
 * @returns {Element|null} null als deze slide geen decoratie heeft.
 */
function decoration(config, assetBase) {
  const layer = el('div', 'w4-slide-decor');
  if (config.shape) {
    const img = document.createElement('img');
    img.className = `w4-slide-shape is-${config.shapeSpot}`;
    img.src = assetUrl(assetBase, `img/shapes/${config.shape}.svg`);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    layer.append(img);
  }
  if (config.icon) {
    const img = document.createElement('img');
    img.className = 'w4-slide-icon';
    img.src = assetUrl(assetBase, `img/icons/${config.icon}.svg`);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    layer.append(img);
  }
  if (config.ghost) {
    // Reusachtig, half doorzichtig nummer of woord achter de tekst.
    const ghost = document.createElement('span');
    ghost.className = 'w4-slide-ghost';
    ghost.textContent = config.ghost;
    ghost.setAttribute('aria-hidden', 'true');
    layer.append(ghost);
  }
  return layer.childNodes.length ? layer : null;
}

/**
 * Vaste slide-elementen: logo rechtsboven en de footer met deck-titel en
 * slidenummer. Op de cover en de afsluiter laten we de footer weg; daar is
 * het logo het onderwerp en geen randversiering.
 */
function chrome(config, { footerText, number, showNumber }) {
  const fragment = document.createDocumentFragment();

  const logo = document.createElement('img');
  logo.className = 'w4-slide-logo';
  logo.src = config.assetBase + (config.dark ? 'img/logo/Logo%20Diap.svg' : 'img/logo/Logo.svg');
  logo.alt = 'Wigo4it';
  fragment.append(logo);

  if (showNumber) {
    const footer = document.createElement('div');
    footer.className = 'w4-slide-footer';
    const left = document.createElement('span');
    left.textContent = footerText || '';
    const right = document.createElement('span');
    right.textContent = String(number);
    footer.append(left, right);
    fragment.append(footer);
  }
  return fragment;
}

/**
 * Bouw een enkele slide-`<section>` voor reveal.
 * @param {object} args
 * @param {string} args.markdown        De markdown van deze slide.
 * @param {(md: string) => string} args.renderMarkdown  markdown -> HTML.
 * @param {number} args.number          Slidenummer voor de footer.
 * @param {string} [args.footerText]    Vaste tekst linksonder.
 * @param {string} [args.assetBase]     Prefix voor img/-paden.
 * @returns {HTMLElement}
 */
export function buildSlide({ markdown, renderMarkdown, number, footerText = '', assetBase = '' }) {
  const withoutDirectives = extractDirectives(markdown);
  const { markdown: content, notes } = extractNotes(withoutDirectives.markdown);
  const config = slideConfig(withoutDirectives.tokens);
  config.assetBase = assetBase;

  const section = document.createElement('section');
  section.className = `w4-slide w4-slide--${config.color}`;
  if (config.layout) section.classList.add(`w4-slide--${config.layout}`);
  if (config.dark) section.classList.add('is-dark');
  // Reveal schildert de achtergrond in een eigen laag; die vult ook de
  // letterbox-randen, wat een gekleurde slide op een breed scherm rustiger maakt.
  section.dataset.backgroundColor = SLIDE_COLORS[config.color].color;
  if (config.transition) section.dataset.transition = config.transition;
  // Een variabele in plaats van een klasse per kleurcombinatie: alle kleine
  // accenten (badges, stamps, tijdlijn, KPI-cijfers) lezen deze ene waarde.
  section.style.setProperty('--slide-accent', SLIDE_COLORS[config.accent].color);

  const body = document.createElement('div');
  body.className = 'w4-slide-body';
  body.append(...htmlToNodes(renderMarkdown(content)));

  const photo = config.layout === 'photo' ? extractPhoto(body) : null;

  const applyLayout = LAYOUT_RENDERERS[config.layout];
  if (applyLayout) applyLayout(body);
  if (config.steps) applySteps(body);

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'w4-slide-eyebrow';
    eyebrow.textContent = config.eyebrow;
    body.prepend(eyebrow);
  }

  const bare = config.layout === 'cover' || config.layout === 'end';
  const decor = decoration(config, assetBase);
  if (decor) section.append(decor);
  section.append(body);
  if (photo) section.prepend(photo);
  section.append(chrome(config, { footerText, number, showNumber: !bare }));

  if (notes) {
    const aside = document.createElement('aside');
    aside.className = 'notes';
    aside.append(...htmlToNodes(renderMarkdown(notes)));
    section.append(aside);
  }

  section.dataset.unknownTokens = config.unknown.join(' ');
  return section;
}

/**
 * Bouw het complete deck: een `<div class="slides">` zoals reveal.js die
 * verwacht, met verticale slides genest in een `<section>`.
 * @param {object} args
 * @param {string} args.source            De hele markdown, inclusief frontmatter.
 * @param {(md: string) => string} args.renderMarkdown
 * @param {string} [args.footerText]      Overschrijft `footer:` uit de frontmatter.
 * @param {string} [args.assetBase]
 * @returns {{slides: HTMLElement, meta: Record<string,string>, count: number,
 *            unknown: string[]}}
 */
export function buildDeck({ source, renderMarkdown, footerText, assetBase = '' }) {
  const { meta, body } = parseFrontMatter(source);
  const groups = splitSlides(body);
  const footer = footerText !== undefined ? footerText : meta.footer || meta.title || '';

  const slides = document.createElement('div');
  slides.className = 'slides';
  const unknown = new Set();
  let number = 0;

  for (const group of groups) {
    const built = group.map((markdown) =>
      buildSlide({ markdown, renderMarkdown, number: ++number, footerText: footer, assetBase })
    );
    for (const section of built) {
      for (const token of section.dataset.unknownTokens.split(' ').filter(Boolean)) {
        unknown.add(token);
      }
    }

    if (built.length === 1) {
      slides.append(built[0]);
    } else {
      // Verticale stapel: reveal verwacht een <section> om de losse slides heen.
      const stack = document.createElement('section');
      stack.append(...built);
      slides.append(stack);
    }
  }

  return { slides, meta, count: number, unknown: Array.from(unknown) };
}
