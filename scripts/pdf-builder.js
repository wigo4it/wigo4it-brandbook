/* ============================================================
   W4 PDF-builder
   Zet gerenderde markdown + gebruikersopties om in een print-klaar
   document (voorblad, optionele inhoudsopgave, footer). Pure logica,
   los te testen. De DOM-globals worden pas bij aanroep gebruikt, niet
   bij het laden van de module.
   ============================================================ */

/**
 * Maak een veilig, stabiel anker-id van een koptekst.
 * Kleinletters, diacritics eraf, niet-alfanumeriek naar koppelteken.
 * Valt terug op "section" als er niets bruikbaars overblijft.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  const slug = String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // niet-alfanumeriek -> koppelteken
    .replace(/^-+|-+$/g, ''); // koppeltekens aan de randen weg
  return slug || 'section';
}

/**
 * Verzamel de h1/h2-koppen uit een container voor de inhoudsopgave.
 * Injecteert een uniek id op elke kop (bestaande id's blijven staan) en
 * geeft per kop {level, text, id} terug in documentvolgorde. h3 en dieper
 * horen niet in de inhoudsopgave en worden overgeslagen.
 * @param {Element} container
 * @returns {{level: number, text: string, id: string}[]}
 */
export function collectHeadings(container) {
  const used = new Set();
  const headings = [];
  for (const el of container.querySelectorAll('h1, h2')) {
    const text = el.textContent.trim();
    let id = el.id || slugify(text);
    if (!el.id) {
      let candidate = id;
      let n = 2;
      while (used.has(candidate)) {
        candidate = `${id}-${n++}`;
      }
      id = candidate;
      el.id = id;
    }
    used.add(id);
    headings.push({ level: Number(el.tagName.slice(1)), text, id });
  }
  return headings;
}

/**
 * Haal het voorwerk uit de content: alles wat voor de eerste h1 staat, zoals
 * een versiebeheer-tabel of changelog. Dat hoort voor de inhoudsopgave en niet
 * erin, want het gaat over het document en niet over de inhoud.
 *
 * De eerste h1 is de documenttitel; staat die vooraan (of ontbreekt hij), dan
 * is er geen voorwerk en blijft de content ongemoeid. De verplaatste elementen
 * verdwijnen uit `content`, zodat collectHeadings ze daarna niet meer ziet.
 *
 * @param {Element} content  De container met de gerenderde markdown.
 * @returns {HTMLElement|null} div.w4-doc-front, of null als er geen voorwerk is.
 */
export function extractFrontMatter(content) {
  const children = Array.from(content.children);
  const titleIndex = children.findIndex((el) => el.tagName === 'H1');
  if (titleIndex <= 0) return null;

  const front = document.createElement('div');
  front.className = 'w4-doc-front w4-doc-content';
  for (const el of children.slice(0, titleIndex)) {
    front.appendChild(el);
  }
  return front;
}

/* Handmatige pagina-einden.
   In de markdown zet je een marker op een eigen regel. markdown-it draait met
   html:false en typographer:true, dus zo'n regel komt hier binnen als gewone
   paragraaf-tekst, en `--` is onderweg al een en-dash geworden. Vandaar de
   ruime dash-klasse in de patronen. */
const PAGEBREAK_PATTERNS = [
  /^<!\s*[-–—]{1,3}\s*page\s*-?\s*break\s*[-–—]{1,3}\s*>$/i, // <!-- pagebreak -->
  /^<\s*page\s*-?\s*break\s*\/?\s*>$/i, // <pagebreak>
  /^\\page\s*-?\s*break$/i, // \pagebreak
];

/**
 * Is deze tekst een pagina-einde-marker?
 * Accepteert `<!-- pagebreak -->`, `<pagebreak>` en `\pagebreak`, met of
 * zonder koppelteken in "page break".
 * @param {string} text
 * @returns {boolean}
 */
export function isPageBreakMarker(text) {
  const trimmed = String(text).trim();
  return PAGEBREAK_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Vervang pagina-einde-markers in de content door een leeg breek-element.
 * Alleen paragrafen die uit niets anders dan de marker bestaan tellen mee, zodat
 * een marker die je in een zin noemt gewoon tekst blijft. De print-CSS hangt
 * `break-after: page` aan `.w4-pagebreak`.
 * @param {Element} container
 * @returns {number} Aantal vervangen markers.
 */
export function applyPageBreaks(container) {
  let count = 0;
  for (const p of Array.from(container.querySelectorAll('p'))) {
    if (!isPageBreakMarker(p.textContent)) continue;
    const brk = document.createElement('div');
    brk.className = 'w4-pagebreak';
    brk.setAttribute('aria-hidden', 'true');
    p.replaceWith(brk);
    count++;
  }
  return count;
}

/* ============================================================
   Mermaid-diagrammen
   Een ```mermaid-blok in de markdown wordt een diagram in het document.
   Hier staat alleen de synchrone, pure kant: het blok herkennen, er een
   lege figure van maken en de SVG die er later in komt fatsoeneren.
   Het tekenen zelf zit in scripts/mermaid-render.js, want dat kent een
   CDN en is asynchroon.
   ============================================================ */

/** Escape voor tekst binnen een HTML-element. */
function escapeText(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape voor een waarde binnen dubbele aanhalingstekens in een attribuut. */
function escapeAttr(str) {
  return escapeText(str).replace(/"/g, '&quot;');
}

/**
 * Fence-hook voor markdown-it: vangt ```mermaid-blokken af.
 *
 * markdown-it roept `highlight(code, lang, attrs)` aan voor elk fenced blok en
 * gebruikt het resultaat letterlijk zodra het met `<pre` begint. Geven we een
 * lege string terug, dan doet de standaard-renderer zijn werk. Zo raken gewone
 * codeblokken niet aan.
 *
 * De rest van de fence-regel komt binnen als `attrs` en is het onderschrift:
 *
 *     ```mermaid Figuur: hoe een aanvraag loopt
 *
 * De standaard-renderer gooit dat weg (alleen het eerste woord wordt een
 * language-class), vandaar dat we hier zelf de HTML schrijven.
 *
 * @param {string} code   De inhoud van het blok.
 * @param {string} lang   Het eerste woord van de fence-regel.
 * @param {string} attrs  De rest van de fence-regel.
 * @returns {string} HTML-string, of '' om markdown-it zijn gang te laten gaan.
 */
export function mermaidFence(code, lang, attrs) {
  if (String(lang || '').trim().toLowerCase() !== 'mermaid') return '';
  const caption = String(attrs || '').trim();
  const captionAttr = caption ? ` data-caption="${escapeAttr(caption)}"` : '';
  return `<pre class="w4-diagram-src"${captionAttr}>${escapeText(code)}</pre>`;
}

/**
 * Zet de mermaid-blokken in de content om in lege figures.
 *
 * De broncode blijft als `pre.w4-diagram-src` in de figure staan. Twee redenen:
 * de renderer leest 'm daar uit, en is mermaid niet te laden, dan hoeft de
 * terugval alleen de pending-klasse weg te halen en staat er weer een gewoon
 * codeblok. De renderer haalt de bron pas weg als het diagram er staat.
 *
 * @param {Element} container
 * @returns {number} Aantal gevonden diagrammen.
 */
export function collectDiagrams(container) {
  const sources = Array.from(container.querySelectorAll('pre.w4-diagram-src'));
  sources.forEach((src, index) => {
    const figure = document.createElement('figure');
    figure.className = 'w4-diagram is-pending';
    figure.setAttribute('data-diagram-index', String(index));

    const body = document.createElement('div');
    body.className = 'w4-diagram-body';

    src.replaceWith(figure);
    body.appendChild(src);
    figure.appendChild(body);

    const caption = src.getAttribute('data-caption');
    if (caption) {
      const cap = document.createElement('figcaption');
      cap.className = 'w4-diagram-caption';
      cap.textContent = caption;
      figure.appendChild(cap);
    }
  });
  return sources.length;
}

/* Hoeveel hoogte een diagram op een A4 mag innemen. De pagina biedt binnen de
   marges 261mm; de rest is ruimte voor het onderschrift en wat lucht. Staat ook
   als --w4-diagram-max-h in styles/pdf.css, en die is leidend; dit is de
   terugval voor als de variabele niet doorkomt. */
const DIAGRAM_MAX_HEIGHT = '235mm';

/**
 * Maak een gerenderde mermaid-SVG geschikt voor een A4-pagina.
 *
 * Mermaid levert een SVG met een eigen breedte en een inline `max-width`. Die
 * halen we eraf en rekenen we opnieuw uit, want alleen `max-height` in CSS is
 * niet genoeg: een inline SVG schaalt daarmee niet betrouwbaar mee in de
 * breedte. We zetten er een `width` met drie grenzen voor terug:
 *
 * 1. `100%`, zodat het diagram nooit buiten de tekstkolom valt;
 * 2. de eigen breedte uit de viewBox, zodat een schema van twee vakjes niet
 *    over de volle kolom uitgerekt wordt. Zonder deze grens groeit de tekst in
 *    het diagram mee en staat er ineens een label van 30px naast bodytekst
 *    van 11pt;
 * 3. de paginahoogte maal de verhouding, zodat een hoog schema past en niet
 *    door Paged.js afgesneden wordt.
 *
 * De kleinste wint, en dezelfde regel geldt in de preview en op papier.
 *
 * @param {SVGElement} svg
 * @param {Object} [opts]
 * @param {string} [opts.label]  Tekst voor aria-label (het onderschrift).
 * @returns {SVGElement} Dezelfde svg, aangepast.
 */
export function normalizeDiagramSvg(svg, opts) {
  const { label = '' } = opts || {};
  const box = viewBoxSize(svg);

  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.removeAttribute('style');

  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('w4-diagram-svg');
  svg.setAttribute('role', 'img');
  if (label) svg.setAttribute('aria-label', label);

  // Zonder bruikbare viewBox weten we de eigen maat niet; dan maar de
  // kolombreedte, nog altijd beter dan mermaids eigen pixelmaat.
  // De variabele krijgt een terugval mee: Paged.js hangt de output in een
  // eigen boom, en een calc() met een onbekende variabele is ongeldig. Dan
  // zou de hele breedte wegvallen, precies in de export.
  svg.style.width = box
    ? `min(100%, ${box.width}px, calc(var(--w4-diagram-max-h, ${DIAGRAM_MAX_HEIGHT}) * ${box.ratio}))`
    : '100%';
  svg.style.height = 'auto';
  return svg;
}

/** Eigen maat en verhouding uit de viewBox, of null als die er niet bruikbaar is. */
function viewBoxSize(svg) {
  const box = svg.getAttribute('viewBox');
  if (!box) return null;
  const parts = box.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [, , width, height] = parts;
  if (!(width > 0) || !(height > 0)) return null;
  return {
    width: Math.round(width),
    ratio: Math.round((width / height) * 10000) / 10000,
  };
}

/* Verwijzingen naar een id: `url(#x)`, `href="#x"` en `#x` als CSS-selector.
   We vervangen alleen namen die in de map staan, zodat een kleurcode als
   #fff met rust gelaten wordt. */
const ID_REFERENCE = /#([A-Za-z_][\w:.-]*)/g;

/**
 * Geef elk id in een SVG een eigen prefix, inclusief de verwijzingen ernaartoe.
 *
 * Nodig omdat bij het exporteren twee kopieën van hetzelfde document in de
 * pagina staan: de preview en de Paged.js-output. Mermaid hangt zijn pijlpunten
 * op aan `marker-end="url(#…)"` en scopet zijn stijlen op een id. Met dubbele
 * id's pakt de browser de eerste in documentvolgorde, en dat is de preview, die
 * bij het printen op `display: none` staat. Of een marker onder een verborgen
 * voorouder dan nog oplost, verschilt per browser; dan verdwijnen de pijlpunten
 * precies in de PDF. Met een uniek prefix per plaatsing speelt dat niet.
 *
 * @param {SVGElement} svg
 * @param {string} prefix
 * @returns {SVGElement} Dezelfde svg, aangepast.
 */
export function reidSvg(svg, prefix) {
  const elements = [svg, ...svg.querySelectorAll('*')];

  const ids = new Map();
  for (const el of elements) {
    const old = el.getAttribute('id');
    if (old && !ids.has(old)) ids.set(old, `${prefix}-${old}`);
  }
  if (!ids.size) return svg;

  const rewrite = (text) =>
    String(text).replace(ID_REFERENCE, (match, name) =>
      ids.has(name) ? `#${ids.get(name)}` : match
    );

  for (const el of elements) {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name === 'id') continue;
      const next = rewrite(attr.value);
      if (next !== attr.value) el.setAttribute(attr.name, next);
    }
    const old = el.getAttribute('id');
    if (old && ids.has(old)) el.setAttribute('id', ids.get(old));
  }

  // Mermaid scopet zijn stijlen op het id van de svg; die selectors moeten mee.
  for (const style of svg.querySelectorAll('style')) {
    style.textContent = rewrite(style.textContent);
  }
  return svg;
}

/**
 * Bouw een inhoudsopgave-element uit de verzamelde koppen. Nesting laten we
 * zien via data-level op de li (h1 = 1, h2 = 2), zodat de opmaak in CSS zit.
 *
 * Elke link krijgt drie delen: het label, een puntjes-leader en een leeg
 * paginanummer-veld. Het nummer vult scripts/pdf-app.js na het pagineren met
 * Paged.js in (de kop kan dan op een pagina gemeten worden). In de live preview
 * blijft het veld leeg, want daar is niets gepagineerd.
 *
 * @param {{level: number, text: string, id: string}[]} headings
 * @returns {HTMLElement} nav.w4-toc
 */
export function renderToc(headings) {
  const nav = document.createElement('nav');
  nav.className = 'w4-toc';

  const title = document.createElement('h2');
  title.className = 'w4-toc-title';
  title.textContent = 'Inhoudsopgave';
  nav.appendChild(title);

  const list = document.createElement('ol');
  list.className = 'w4-toc-list';
  for (const h of headings) {
    const item = document.createElement('li');
    item.className = `w4-toc-item w4-toc-l${h.level}`;
    item.setAttribute('data-level', String(h.level));

    const link = document.createElement('a');
    link.setAttribute('href', `#${h.id}`);

    const label = document.createElement('span');
    label.className = 'w4-toc-label';
    label.textContent = h.text;

    const dots = document.createElement('span');
    dots.className = 'w4-toc-dots';
    dots.setAttribute('aria-hidden', 'true');

    const page = document.createElement('span');
    page.className = 'w4-toc-page';

    link.appendChild(label);
    link.appendChild(dots);
    link.appendChild(page);

    item.appendChild(link);
    list.appendChild(item);
  }
  nav.appendChild(list);
  return nav;
}

/**
 * Strip de YAML-frontmatter (optioneel, bovenaan, tussen twee `---`-regels) uit
 * de markdown, zodat die niet als inhoud in het document belandt. Zonder
 * frontmatter blijft de tekst ongemoeid.
 * @param {string} source
 * @returns {string}
 */
export function stripFrontMatter(source) {
  const text = String(source).replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  if (lines[0].trim() !== '---') return text;

  const end = lines.indexOf('---', 1);
  if (end === -1) return text;

  return lines.slice(end + 1).join('\n').replace(/^\n+/, '');
}

/**
 * Leid een nette voorblad-titel af van een bestandsnaam. Haalt een bekende
 * markdown/tekst-extensie eraf, maakt van koppeltekens en underscores spaties
 * en zet de eerste letter groot. Valt terug op "Document".
 * @param {string} filename
 * @returns {string}
 */
export function filenameToTitle(filename) {
  const base = String(filename)
    .replace(/\.(md|markdown|txt)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!base) return 'Document';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** De voorblad-varianten die we ondersteunen. */
export const COVER_VARIANTS = ['green', 'aubergine', 'white'];

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

/**
 * Formatteer een ISO-datum (YYYY-MM-DD) naar Nederlandse lange notatie,
 * bijvoorbeeld "14 juli 2026". Parseert de delen zelf om tijdzone-verschuiving
 * te vermijden. Ongeldige of lege invoer geeft een lege string.
 * @param {string} iso
 * @returns {string}
 */
export function formatDateNL(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());
  if (!m) return '';
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  return `${day} ${MONTHS_NL[month - 1]} ${year}`;
}

/**
 * Stel het print-klare document samen: optioneel voorblad, het voorwerk,
 * optionele inhoudsopgave, de content en optioneel een per-pagina footer.
 *
 * Volgorde in het document: voorblad, voorwerk, inhoudsopgave, content.
 *
 * Blijft synchroon. Mermaid-blokken worden hier lege figures; die vult
 * scripts/mermaid-render.js daarna.
 *
 * @param {Object} opts
 * @param {string} opts.contentHtml   Gerenderde markdown (HTML-string).
 * @param {string} [opts.cover]       'green' | 'aubergine' | 'white' | 'none'.
 * @param {string} [opts.coverTitle]  Titel op het voorblad.
 * @param {string} [opts.coverSubtitle] Ondertitel op het voorblad.
 * @param {string} [opts.coverDate]   Datum op het voorblad; leeg = geen datum.
 * @param {boolean} [opts.includeToc] Inhoudsopgave meenemen.
 * @param {string} [opts.footerText]  Footer-tekst; leeg = geen footer.
 * @returns {HTMLElement} article.w4-doc
 */
export function assembleDocument(opts) {
  const {
    contentHtml = '',
    cover = 'none',
    coverTitle = '',
    coverSubtitle = '',
    coverDate = '',
    includeToc = false,
    footerText = '',
  } = opts || {};

  const root = document.createElement('article');
  root.className = 'w4-doc';

  // Content eerst opbouwen: daar hangen de koppen aan die de TOC nodig heeft.
  const content = document.createElement('div');
  content.className = 'w4-doc-content';
  content.innerHTML = contentHtml;
  // Markers eerst omzetten, dan pas knippen: een pagina-einde in het voorwerk
  // hoort net zo goed te werken.
  applyPageBreaks(content);
  // Lege figures voor de mermaid-blokken. Ze worden hier alleen neergezet; het
  // vullen is asynchroon en gebeurt in de app-laag, na het samenstellen.
  collectDiagrams(content);
  // Voorwerk er eerst uit, anders komen die koppen alsnog in de TOC terecht.
  const front = extractFrontMatter(content);
  const headings = collectHeadings(content);

  if (COVER_VARIANTS.includes(cover)) {
    root.appendChild(buildCover(cover, { title: coverTitle, subtitle: coverSubtitle, date: coverDate }));
  }

  if (front) {
    root.appendChild(front);
  }

  if (includeToc) {
    root.appendChild(renderToc(headings));
  }

  root.appendChild(content);

  if (footerText) {
    root.setAttribute('data-footer', footerText);
    const footer = document.createElement('div');
    footer.className = 'w4-page-footer';
    footer.setAttribute('aria-hidden', 'true');
    footer.textContent = footerText;
    root.appendChild(footer);
  }

  return root;
}

/**
 * Bouw een voorblad in een van de merk-varianten.
 * @param {string} variant  'green' | 'aubergine' | 'white'
 * @param {Object} meta
 * @param {string} [meta.title]
 * @param {string} [meta.subtitle]
 * @param {string} [meta.date]  Al geformatteerde datumtekst.
 * @returns {HTMLElement} section.w4-cover-page
 */
function buildCover(variant, meta) {
  const { title = '', subtitle = '', date = '' } = meta || {};
  const section = document.createElement('section');
  section.className = `w4-cover-page w4-cover--${variant}`;

  const heading = document.createElement('h1');
  heading.className = 'w4-cover-page-title';
  heading.textContent = title;
  section.appendChild(heading);

  if (subtitle) {
    const sub = document.createElement('p');
    sub.className = 'w4-cover-page-subtitle';
    sub.textContent = subtitle;
    section.appendChild(sub);
  }

  if (date) {
    const dateEl = document.createElement('p');
    dateEl.className = 'w4-cover-page-date';
    dateEl.textContent = date;
    section.appendChild(dateEl);
  }

  return section;
}
