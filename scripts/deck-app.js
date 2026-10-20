/* ============================================================
   W4 Markdown -> slide-deck: UI-glue
   Koppelt het instellingen-paneel aan de preview (deck-view.html in
   een iframe), zet het deck klaar voor de presentatieweergave en
   exporteert een los HTML-bestand. De slide-logica zelf staat in
   scripts/deck-builder.js.
   ============================================================ */
import {
  EXAMPLE_DECK,
  MARKDOWN_OPTIONS,
  REVEAL_BASE,
  STORAGE_OPTIONS,
  STORAGE_SOURCE,
  assetIssues,
  buildDeck,
  extractDirectives,
  fitDecoration,
  slideConfig,
  splitSlides,
  parseFrontMatter,
} from './deck-builder.js';
import { loadAssets, names } from './assets.js';
import { bindMarkdownFile } from './markdown-file.js';

const els = {
  file: document.getElementById('deck-file'),
  dropzone: document.getElementById('deck-dropzone'),
  dropzoneText: document.getElementById('deck-dropzone-text'),
  fileStatus: document.getElementById('deck-file-status'),
  footer: document.getElementById('deck-footer'),
  transition: document.getElementById('deck-transition'),
  warning: document.getElementById('deck-warning'),
  frame: document.getElementById('deck-frame'),
  sub: document.getElementById('deck-canvas-sub'),
  present: document.getElementById('deck-present'),
  pdf: document.getElementById('deck-pdf'),
  download: document.getElementById('deck-download'),
};

let markdownSource = '';
let hasFile = false;
let frameReady = false;
// Namen uit assets.json, om shape:/icon:-tokens tegen te controleren. Blijft
// leeg tot het manifest binnen is; dan slaat de controle over, niet aan.
let assetNames = {};

function options() {
  return {
    footerText: els.footer.value.trim() || undefined,
    transition: els.transition.value,
  };
}

/** Stuur de huidige markdown naar de preview-iframe. */
function pushToPreview() {
  if (!frameReady) return;
  els.frame.contentWindow.postMessage(
    { type: 'w4-deck', source: markdownSource, options: options() },
    window.location.origin
  );
}

/**
 * Controleer de tokens op typefouten. De builder negeert onbekende tokens en
 * een verkeerde asset-naam levert een stille 404 op; dat is precies waar je in
 * een presentatie niet achter wil komen.
 */
function checkTokens() {
  const unknown = new Set();
  const missing = new Map();
  let slides = 0;
  for (const group of splitSlides(parseFrontMatter(markdownSource).body)) {
    for (const slide of group) {
      slides += 1;
      const config = slideConfig(extractDirectives(slide).tokens);
      for (const token of config.unknown) unknown.add(token);
      for (const issue of assetIssues(config, assetNames)) {
        missing.set(`${issue.kind}:${issue.value}`, issue);
      }
    }
  }

  els.sub.textContent = slides
    ? `${slides} slides, 16:9`
    : '16:9, zoals het op de beamer komt';

  const messages = [];
  if (unknown.size) {
    messages.push(`Onbekende tokens, worden genegeerd: ${[...unknown].join(', ')}`);
  }
  for (const issue of missing.values()) {
    messages.push(
      issue.suggestion
        ? `Onbekende ${issue.kind}: "${issue.value}". Bedoelde je "${issue.suggestion}"?`
        : `Onbekende ${issue.kind}: "${issue.value}". Staat niet in assets.json.`
    );
  }

  els.warning.textContent = messages.join('\n');
  els.warning.hidden = messages.length === 0;
}

function update() {
  checkTokens();
  pushToPreview();
}

/** Zet het deck klaar en open de presentatieweergave in een nieuw tabblad. */
function present() {
  if (!markdownSource) return;
  storeDeck();
  window.open('deck-view.html', '_blank', 'noopener');
}

/** Bewaar de bron en instellingen voor een zelfstandige deck-weergave. */
function storeDeck() {
  localStorage.setItem(STORAGE_SOURCE, markdownSource);
  localStorage.setItem(STORAGE_OPTIONS, JSON.stringify(options()));
}

/** Open RevealJS in zijn PDF-printmodus en laat die pagina de printdialoog starten. */
function downloadPdf() {
  if (!markdownSource) return;
  storeDeck();
  window.open('deck-view.html?print-pdf=1&auto-print=1', '_blank', 'noopener');
}

/**
 * Exporteer een los HTML-bestand met het deck erin. Reveal komt van de CDN,
 * onze eigen CSS gaat mee in het bestand en de plaatjes blijven naar de
 * brandbook-site wijzen. Zo is het bestand te mailen zonder de hele repo.
 */
async function downloadHtml() {
  if (!markdownSource) return;

  const source = markdownSource;
  const exportOptions = options();
  const base = new URL('.', window.location.href).href;
  els.download.disabled = true;
  try {
    const sheets = await Promise.all(
      ['styles/w4.css', 'styles/deck.css'].map(async (path) => {
        const css = await fetch(path).then((r) => r.text());
        // Relatieve url()-verwijzingen (../img, ../fonts) staan straks op een
        // andere plek; maak ze absoluut naar deze site.
        return css.replace(/url\((['"]?)\.\.\//g, (_m, quote) => `url(${quote}${base}`);
      })
    );

    const { slides, meta } = buildDeck({
      source,
      renderMarkdown: (source) => renderMarkdown(source),
      footerText: exportOptions.footerText,
      assetBase: base,
    });

    const title = meta.title || 'Wigo4it presentatie';
    const html = deckDocument({ title, slides: slides.innerHTML, css: sheets.join('\n'), transition: exportOptions.transition });
    saveFile(`${slugFilename(title)}.html`, html);
  } finally {
    els.download.disabled = false;
  }
}

/** Het complete HTML-document rond de slides heen. */
function deckDocument({ title, slides, css, transition }) {
  const reveal = 'https://cdn.jsdelivr.net/npm/reveal.js@5.1.0';
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${reveal}/dist/reveal.css" />
<style>
${css}
</style>
</head>
<body class="deck-view-body">
<div class="reveal"><div class="slides">
${slides}
</div></div>
<script src="${reveal}/dist/reveal.js"><\/script>
<script src="${reveal}/plugin/notes/notes.js"><\/script>
<script>
${fitDecoration.toString()}
Reveal.initialize({
  ...${JSON.stringify(REVEAL_BASE)},
  transition: ${JSON.stringify(transition)},
  plugins: window.RevealNotes ? [RevealNotes] : []
}).then(() => fitDecoration(Reveal));
<\/script>
</body>
</html>
`;
}

function saveFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/html' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function slugFilename(title) {
  return (
    title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'deck'
  );
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** markdown -> HTML. Alleen nodig voor de export; de preview rendert zelf. */
function renderMarkdown(source) {
  if (!window.markdownit) return `<p>${escapeHtml(source)}</p>`;
  return window.markdownit(MARKDOWN_OPTIONS).render(source);
}

bindMarkdownFile({
  input: els.file,
  dropzone: els.dropzone,
  label: els.dropzoneText,
  status: els.fileStatus,
  onChange(source) {
    hasFile = true;
    markdownSource = source;
    update();
  },
});

els.footer.addEventListener('input', update);
els.transition.addEventListener('change', update);
els.present.addEventListener('click', present);
els.pdf.addEventListener('click', downloadPdf);
els.download.addEventListener('click', downloadHtml);

els.frame.addEventListener('load', () => {
  frameReady = true;
  pushToPreview();
});

// De namen van shapes en icons komen uit het manifest. Lukt dat niet, dan
// werkt de tool gewoon door; alleen de controle op typefouten valt weg.
loadAssets()
  .then((manifest) => {
    assetNames = { shapes: names(manifest, 'shapes', 'svg'), icons: names(manifest, 'icons', 'svg') };
    if (markdownSource) checkTokens();
  })
  .catch(() => {
    /* geen manifest: shape:/icon: worden niet gecontroleerd */
  });

// Zonder eigen bestand draait de tool op het voorbeelddeck, zodat de preview
// meteen laat zien wat de syntax oplevert.
fetch(EXAMPLE_DECK)
  .then((response) => (response.ok ? response.text() : ''))
  .then((text) => {
    if (!text || hasFile) return;
    markdownSource = text;
    update();
  })
  .catch(() => {
    /* offline of via file://: preview blijft leeg, de tool werkt verder */
  });
