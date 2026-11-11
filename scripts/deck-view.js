/* ============================================================
   W4 Deck-view: de presentatie zelf
   Haalt de markdown op (uit de tool via postMessage of localStorage,
   anders het meegeleverde voorbeeld), laat deck-builder.js er slides
   van maken en start reveal.js. Alles client-side.
   ============================================================ */
import {
  EXAMPLE_DECK,
  MARKDOWN_OPTIONS,
  REVEAL_BASE,
  STORAGE_OPTIONS,
  STORAGE_SOURCE,
  buildDeck,
  fitDecoration,
} from './deck-builder.js';
import { getPresentation, loginHref, me, presentationIdFromPath } from './brandbook-api.js';

const slidesEl = document.getElementById('deck-slides');
const emptyEl = document.getElementById('deck-empty');
const params = new URLSearchParams(window.location.search);
const pdfExport = params.has('print-pdf');

const md = window.markdownit ? window.markdownit(MARKDOWN_OPTIONS) : null;

/** markdown -> HTML. Zonder markdown-it (CDN weg) tonen we platte tekst. */
function renderMarkdown(source) {
  if (md) return md.render(source);
  const div = document.createElement('div');
  div.textContent = source;
  return `<p>${div.innerHTML}</p>`;
}

let deck = null; // de reveal-instantie, zodra er slides zijn

/**
 * Bouw het deck en start (of ververs) reveal.
 * @param {string} source   De markdown van het hele deck.
 * @param {{footerText?: string, transition?: string}} options
 */
async function render(source, options = {}) {
  const position = deck ? deck.getIndices() : null;
  const built = buildDeck({
    source,
    renderMarkdown,
    footerText: options.footerText,
  });
  if (!built.count) {
    slidesEl.replaceChildren();
    emptyEl.hidden = false;
    document.title = 'Wigo4it | Presentatie';
    if (deck) deck.sync();
    return;
  }

  slidesEl.replaceChildren(...built.slides.childNodes);
  emptyEl.hidden = true;
  document.title = built.meta.title
    ? `${built.meta.title} | Wigo4it`
    : 'Wigo4it | Presentatie';

  if (!window.Reveal) return; // CDN niet beschikbaar: slides staan er wel, geen navigatie

  if (deck) {
    // Zelfde instantie hergebruiken; sync() leest de nieuwe slides in.
    deck.configure({ transition: options.transition || 'slide' });
    deck.sync();
    const h = Math.min(position.h, slidesEl.children.length - 1);
    const verticalSlides = slidesEl.children[h].querySelectorAll(':scope > section').length;
    const v = Math.min(position.v, Math.max(0, verticalSlides - 1));
    deck.slide(h, v);
    return;
  }

  deck = window.Reveal;
  await deck.initialize({
    ...REVEAL_BASE,
    controls: !pdfExport,
    progress: !pdfExport,
    slideNumber: false,
    transition: pdfExport ? 'none' : options.transition || 'slide',
    pdfMaxPagesPerSlide: 1,
    pdfSeparateFragments: false,
    plugins: window.RevealNotes ? [window.RevealNotes] : [],
  });

  if (pdfExport) {
    await printPdfWhenReady();
  } else {
    fitDecoration(deck);
  }
}

/**
 * Geef fonts en afbeeldingen tijd om scherp in de PDF te landen. Twee frames
 * extra zijn nodig omdat Reveal zijn printpagina's pas na initialisatie meet.
 */
async function printPdfWhenReady() {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  await Promise.all(
    [...document.images].map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    })
  );
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (params.get('auto-print') === '1') window.print();
}

/** Opties uit localStorage, met een lege set als er niets (geldigs) staat. */
function storedOptions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_OPTIONS) || '{}');
  } catch {
    return {};
  }
}

/** Live preview: de tool-pagina stuurt de markdown bij elke wijziging door. */
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const data = event.data;
  if (!data || data.type !== 'w4-deck' || typeof data.source !== 'string') return;
  render(data.source, data.options || {});
});

/**
 * Startbron bepalen. In preview-modus wachten we op de tool; anders pakken we
 * wat de tool in localStorage heeft achtergelaten, en anders het voorbeelddeck
 * zodat deze pagina ook los iets laat zien.
 */
async function boot() {
  if (params.get('preview') === '1') return;

  // Gepubliceerde presentatie: /present/<id>. Bestaat hij niet, of is hij
  // privé en ben je niet ingelogd, dan zegt de API allebei 404.
  const id = presentationIdFromPath();
  if (id) {
    try {
      const presentation = await getPresentation(id);
      render(presentation.markdown, presentation.options || {});
    } catch (error) {
      showMissing(error.status === 404);
    }
    return;
  }

  const stored = localStorage.getItem(STORAGE_SOURCE);
  if (stored) {
    render(stored, storedOptions());
    return;
  }

  try {
    const response = await fetch(EXAMPLE_DECK);
    if (response.ok) render(await response.text(), {});
  } catch {
    // Offline of via file://: de lege staat blijft staan en legt uit wat te doen.
  }
}

/** Lege staat voor een permalink die we niet (mogen) tonen. */
async function showMissing(notFound) {
  const { loggedIn } = await me();
  const heading = emptyEl.querySelector('h1');
  const text = emptyEl.querySelector('p');
  heading.textContent = notFound ? 'Presentatie niet gevonden' : 'Presentatie kon niet laden';
  text.textContent = notFound
    ? loggedIn
      ? 'Deze link bestaat niet (meer), of de presentatie is van iemand anders.'
      : 'Deze link bestaat niet (meer), of de presentatie is privé. '
    : 'Probeer het over een moment opnieuw.';
  if (notFound && !loggedIn) {
    const link = document.createElement('a');
    link.href = loginHref();
    link.textContent = 'Log in om privé presentaties te bekijken.';
    text.append(link);
  }
  emptyEl.hidden = false;
}

boot();
