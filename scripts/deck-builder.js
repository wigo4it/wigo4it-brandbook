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

/** Layouts die de builder structureel anders opbouwt. */
export const SLIDE_LAYOUTS = ['cover', 'statement', 'split', 'columns', 'quote', 'end'];

/** Posities voor een decoratieve shape. */
const SHAPE_SPOTS = ['topright', 'topleft', 'bottomright', 'bottomleft'];

const DEFAULT_COLOR = 'white';

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
    if (match) tokens.push(...match[1].split(/\s+/).filter(Boolean));
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
 * @returns {{color: string, dark: boolean, layout: string, transition: string,
 *            shape: string, shapeSpot: string, icon: string, steps: boolean,
 *            unknown: string[]}}
 */
export function slideConfig(tokens = []) {
  const config = {
    color: DEFAULT_COLOR,
    dark: SLIDE_COLORS[DEFAULT_COLOR].dark,
    layout: '',
    transition: '',
    shape: '',
    shapeSpot: 'topright',
    icon: '',
    steps: false,
    unknown: [],
  };

  for (const raw of tokens) {
    const token = String(raw).trim();
    if (!token) continue;
    const [key, value = ''] = token.split(':');

    if (SLIDE_COLORS[token]) {
      config.color = token;
      config.dark = SLIDE_COLORS[token].dark;
    } else if (SLIDE_LAYOUTS.includes(token)) {
      config.layout = token;
    } else if (token === 'steps') {
      config.steps = true;
    } else if (key === 'shape' && value) {
      const [name, spot] = value.split('@');
      config.shape = name;
      if (SHAPE_SPOTS.includes(spot)) config.shapeSpot = spot;
    } else if (key === 'icon' && value) {
      config.icon = value;
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
  return config;
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

/**
 * Split-layout: alles voor de eerste `<hr>` wordt de linkerkolom, de rest de
 * rechter. Zonder `<hr>` (in markdown: `***`) blijft de slide zoals hij was.
 * @param {Element} body
 */
function applySplit(body) {
  const nodes = Array.from(body.childNodes);
  const divider = nodes.find((n) => n.nodeName === 'HR');
  if (!divider) return;

  const index = nodes.indexOf(divider);
  const left = document.createElement('div');
  const right = document.createElement('div');
  left.className = 'w4-slide-panel';
  right.className = 'w4-slide-panel';
  left.append(...nodes.slice(0, index));
  right.append(...nodes.slice(index + 1));
  divider.remove();

  const grid = document.createElement('div');
  grid.className = 'w4-slide-split';
  grid.append(left, right);
  body.replaceChildren(grid);
}

/**
 * Kolommen-layout: elke `###`-kop start een kaart, met alles eronder erin.
 * Wat voor de eerste `###` staat (meestal de slidetitel) blijft bovenaan.
 * @param {Element} body
 */
function applyColumns(body) {
  const nodes = Array.from(body.childNodes);
  const before = [];
  const cards = [];
  let current = null;

  for (const node of nodes) {
    if (node.nodeName === 'H3') {
      current = document.createElement('article');
      current.className = 'w4-slide-card';
      cards.push(current);
    }
    if (current) current.append(node);
    else before.push(node);
  }
  if (!cards.length) return;

  const grid = document.createElement('div');
  grid.className = 'w4-slide-cards';
  grid.dataset.count = String(cards.length);
  grid.append(...cards);
  body.replaceChildren(...before, grid);
}

/** Laat lijstitems een voor een verschijnen (reveal-fragments). */
function applySteps(body) {
  for (const item of body.querySelectorAll('li')) {
    item.classList.add('fragment', 'fade-up');
  }
}

/** Decoratieve shape of icoon voor op de slide. */
function decoration(config, assetBase) {
  const layer = document.createDocumentFragment();
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
  return layer;
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

  const body = document.createElement('div');
  body.className = 'w4-slide-body';
  body.append(...htmlToNodes(renderMarkdown(content)));

  if (config.layout === 'split') applySplit(body);
  if (config.layout === 'columns') applyColumns(body);
  if (config.steps) applySteps(body);

  const bare = config.layout === 'cover' || config.layout === 'end';
  section.append(decoration(config, assetBase), body);
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
