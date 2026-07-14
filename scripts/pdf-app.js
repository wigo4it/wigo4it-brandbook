/* ============================================================
   W4 Markdown -> PDF: UI-glue
   Koppelt het instellingen-paneel aan de geteste builder-logica
   (scripts/pdf-builder.js), rendert de live preview en start de
   browser-print. markdown-it (CDN) doet de markdown -> HTML stap.
   ============================================================ */
import { assembleDocument } from './pdf-builder.js';

const md = window.markdownit
  ? window.markdownit({ html: false, linkify: true, typographer: true })
  : null;

const els = {
  markdown: document.getElementById('pdf-markdown'),
  title: document.getElementById('pdf-title'),
  subtitle: document.getElementById('pdf-subtitle'),
  toc: document.getElementById('pdf-toc'),
  footer: document.getElementById('pdf-footer'),
  preview: document.getElementById('pdf-preview'),
  paged: document.getElementById('pdf-paged'),
  print: document.getElementById('pdf-print'),
};

function selectedCover() {
  const checked = document.querySelector('input[name="pdf-cover"]:checked');
  return checked ? checked.value : 'none';
}

/** Stel het document samen uit de huidige instellingen. */
function buildDoc() {
  const source = els.markdown.value;
  const contentHtml = md ? md.render(source) : escapeHtml(source);

  const doc = assembleDocument({
    contentHtml,
    cover: selectedCover(),
    coverTitle: els.title.value.trim(),
    coverSubtitle: els.subtitle.value.trim(),
    includeToc: els.toc.checked,
    footerText: els.footer.value.trim(),
  });

  addCoverLogo(doc);
  return doc;
}

function render() {
  els.preview.replaceChildren(buildDoc());
  // Elke wijziging maakt de vorige paginering ongeldig.
  els.paged.replaceChildren();
}

/** Diapositief-logo op elk voorblad, voor donkere achtergronden. */
function addCoverLogo(doc) {
  const cover = doc.querySelector('.w4-cover-page');
  if (!cover) return;
  const logo = document.createElement('img');
  logo.className = 'w4-cover-page-logo';
  logo.src = 'img/logo/Logo Diap.svg';
  logo.alt = 'Wigo4it';
  cover.prepend(logo);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return `<pre>${div.innerHTML}</pre>`;
}

/**
 * Bouw de @page-regels die Paged.js in de marge-boxen rendert:
 * footer-tekst (optioneel) links, paginanummer rechts, en een schone
 * cover-pagina zonder marge/footer/nummer.
 */
function buildPageCss(footerText) {
  const marginBox = 'font-family:"Raleway",sans-serif;font-size:8.5pt;color:rgba(54,44,70,0.7);';
  const footerRule = footerText
    ? `@bottom-left { content: ${JSON.stringify(footerText)}; ${marginBox} }`
    : '';
  return `
    @page {
      size: A4;
      margin: 18mm;
      ${footerRule}
      @bottom-right { content: counter(page) " / " counter(pages); ${marginBox} }
    }
    @page cover {
      margin: 0;
      @bottom-left { content: none; }
      @bottom-right { content: none; }
    }
    .w4-cover-page { page: cover; break-after: page; }
    .w4-toc { break-after: page; }
  `;
}

let pageCssUrl = null;

/** Pagineer met Paged.js en open daarna het printvenster. */
async function exportPdf() {
  if (!window.Paged || !window.Paged.Previewer) {
    // Paged.js niet geladen (offline/CDN): val terug op een gewone print.
    window.print();
    return;
  }

  els.print.disabled = true;
  els.print.textContent = 'Pagineren...';
  try {
    const doc = buildDoc();
    els.paged.replaceChildren();

    if (pageCssUrl) URL.revokeObjectURL(pageCssUrl);
    pageCssUrl = URL.createObjectURL(
      new Blob([buildPageCss(els.footer.value.trim())], { type: 'text/css' })
    );

    const previewer = new window.Paged.Previewer();
    await previewer.preview(
      doc.outerHTML,
      ['styles/w4.css', 'styles/pdf.css', pageCssUrl],
      els.paged
    );
    window.print();
  } finally {
    els.print.disabled = false;
    els.print.textContent = 'Exporteer naar PDF';
  }
}

// Herrender bij elke wijziging; goedkoop genoeg voor deze schaal.
for (const el of [els.markdown, els.title, els.subtitle, els.footer]) {
  el.addEventListener('input', render);
}
for (const el of [els.toc, ...document.querySelectorAll('input[name="pdf-cover"]')]) {
  el.addEventListener('change', render);
}
els.print.addEventListener('click', exportPdf);

render();
