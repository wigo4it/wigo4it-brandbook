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
 * Bouw een inhoudsopgave-element uit de verzamelde koppen. Nesting laten we
 * zien via data-level op de li (h1 = 1, h2 = 2), zodat de opmaak in CSS zit.
 * @param {{level: number, text: string, id: string}[]} headings
 * @returns {HTMLElement} nav.w4-toc
 */
export function renderToc(headings) {
  const nav = document.createElement('nav');
  nav.className = 'w4-toc';

  const title = document.createElement('h2');
  title.className = 'w4-toc-title';
  title.textContent = 'Inhoud';
  nav.appendChild(title);

  const list = document.createElement('ol');
  list.className = 'w4-toc-list';
  for (const h of headings) {
    const item = document.createElement('li');
    item.className = `w4-toc-item w4-toc-l${h.level}`;
    item.setAttribute('data-level', String(h.level));

    const link = document.createElement('a');
    link.setAttribute('href', `#${h.id}`);
    link.textContent = h.text;

    item.appendChild(link);
    list.appendChild(item);
  }
  nav.appendChild(list);
  return nav;
}

/** De drie voorblad-varianten die we ondersteunen. */
export const COVER_VARIANTS = ['green', 'aubergine', 'pink'];

/**
 * Stel het print-klare document samen: optioneel voorblad, optionele
 * inhoudsopgave, de content en optioneel een per-pagina footer.
 *
 * Volgorde in het document: voorblad, inhoudsopgave, content.
 *
 * @param {Object} opts
 * @param {string} opts.contentHtml   Gerenderde markdown (HTML-string).
 * @param {string} [opts.cover]       'green' | 'aubergine' | 'pink' | 'none'.
 * @param {string} [opts.coverTitle]  Titel op het voorblad.
 * @param {string} [opts.coverSubtitle] Ondertitel op het voorblad.
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
    includeToc = false,
    footerText = '',
  } = opts || {};

  const root = document.createElement('article');
  root.className = 'w4-doc';

  // Content eerst opbouwen: daar hangen de koppen aan die de TOC nodig heeft.
  const content = document.createElement('div');
  content.className = 'w4-doc-content';
  content.innerHTML = contentHtml;
  const headings = collectHeadings(content);

  if (COVER_VARIANTS.includes(cover)) {
    root.appendChild(buildCover(cover, coverTitle, coverSubtitle));
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
 * @param {string} variant  'green' | 'aubergine' | 'pink'
 * @param {string} title
 * @param {string} subtitle
 * @returns {HTMLElement} section.w4-cover-page
 */
function buildCover(variant, title, subtitle) {
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

  return section;
}
