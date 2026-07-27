/* ============================================================
   W4 Deck-view: de presentatie zelf
   Haalt de markdown op (uit de tool via postMessage of localStorage,
   anders het meegeleverde voorbeeld), laat deck-builder.js er slides
   van maken en start reveal.js. Alles client-side.
   ============================================================ */
import { buildDeck, fitDecoration } from './deck-builder.js';

const STORAGE_SOURCE = 'w4-deck-source';
const STORAGE_OPTIONS = 'w4-deck-options';
const EXAMPLE = 'examples/deck-voorbeeld.md';

const slidesEl = document.getElementById('deck-slides');
const emptyEl = document.getElementById('deck-empty');

const md = window.markdownit
  ? window.markdownit({ html: true, linkify: true, typographer: true })
  : null;

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
  const built = buildDeck({
    source,
    renderMarkdown,
    footerText: options.footerText,
  });
  if (!built.count) return;

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
    deck.slide(0);
    return;
  }

  deck = window.Reveal;
  await deck.initialize({
    width: 1600,
    height: 900,
    margin: 0,
    center: false, // elke slide vult de volle hoogte; zie styles/deck.css
    hash: false,
    controls: true,
    progress: true,
    slideNumber: false,
    transition: options.transition || 'slide',
    plugins: window.RevealNotes ? [window.RevealNotes] : [],
  });
  fitDecoration(deck);
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
  const params = new URLSearchParams(window.location.search);
  if (params.get('preview') === '1') return;

  const stored = localStorage.getItem(STORAGE_SOURCE);
  if (stored) {
    render(stored, storedOptions());
    return;
  }

  try {
    const response = await fetch(EXAMPLE);
    if (response.ok) render(await response.text(), {});
  } catch {
    // Offline of via file://: de lege staat blijft staan en legt uit wat te doen.
  }
}

boot();
