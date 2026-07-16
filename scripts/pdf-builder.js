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
