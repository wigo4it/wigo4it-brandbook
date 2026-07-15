/* ============================================================
   W4 Markdown -> PDF: UI-glue
   Koppelt het instellingen-paneel aan de geteste builder-logica
   (scripts/pdf-builder.js), rendert de live preview en start de
   browser-print. markdown-it (CDN) doet de markdown -> HTML stap.
   ============================================================ */
import { assembleDocument, filenameToTitle, formatDateNL } from './pdf-builder.js';

const md = window.markdownit
  ? window.markdownit({ html: false, linkify: true, typographer: true })
  : null;

const els = {
  file: document.getElementById('pdf-file'),
  dropzone: document.getElementById('pdf-dropzone'),
  dropzoneText: document.getElementById('pdf-dropzone-text'),
  title: document.getElementById('pdf-title'),
  subtitle: document.getElementById('pdf-subtitle'),
  dateToggle: document.getElementById('pdf-date-toggle'),
  date: document.getElementById('pdf-date'),
  toc: document.getElementById('pdf-toc'),
  footer: document.getElementById('pdf-footer'),
  preview: document.getElementById('pdf-preview'),
  paged: document.getElementById('pdf-paged'),
  print: document.getElementById('pdf-print'),
};

// De markdown komt uitsluitend uit een geupload bestand; hier bewaard.
let markdownSource = '';

function selectedCover() {
  const checked = document.querySelector('input[name="pdf-cover"]:checked');
  return checked ? checked.value : 'none';
}

/** Stel het document samen uit de huidige instellingen. */
function buildDoc() {
  const contentHtml = md ? md.render(markdownSource) : escapeHtml(markdownSource);

  const doc = assembleDocument({
    contentHtml,
    cover: selectedCover(),
    coverTitle: els.title.value.trim(),
    coverSubtitle: els.subtitle.value.trim(),
    coverDate: els.dateToggle.checked ? formatDateNL(els.date.value) : '',
    includeToc: els.toc.checked,
    footerText: els.footer.value.trim(),
  });

  addCoverLogo(doc);
  return doc;
}

function render() {
  // Elke wijziging maakt de vorige paginering ongeldig.
  els.paged.replaceChildren();
  if (!markdownSource) {
    els.preview.replaceChildren(emptyState());
    return;
  }
  els.preview.replaceChildren(buildDoc());
}

/** Placeholder in de preview zolang er nog geen bestand geladen is. */
function emptyState() {
  const box = document.createElement('p');
  box.className = 'pdf-empty';
  box.textContent = 'Nog geen bestand geladen. Kies of sleep een .md-bestand.';
  return box;
}

/** Logo op het voorblad: diapositief op donker, gewoon logo op wit. */
function addCoverLogo(doc) {
  const cover = doc.querySelector('.w4-cover-page');
  if (!cover) return;
  const onWhite = cover.classList.contains('w4-cover--white');
  const logo = document.createElement('img');
  logo.className = 'w4-cover-page-logo';
  logo.src = onWhite ? 'img/logo/Logo.svg' : 'img/logo/Logo Diap.svg';
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
    .w4-toc { break-before: page; break-after: page; }
  `;
}

let pageCssUrl = null;

/** Zoek een element op id binnen een subtree (ids uit slugify zijn veilig,
 *  maar kunnen met een cijfer beginnen; CSS.escape vangt dat af). */
function findById(root, id) {
  try {
    return root.querySelector(`#${CSS.escape(id)}`);
  } catch {
    return root.querySelector(`[id="${id.replace(/"/g, '\\"')}"]`);
  }
}

/**
 * Vul de paginanummers in de inhoudsopgave nadat Paged.js het document heeft
 * gepagineerd. Per link zoeken we de doelkop op in de Paged-output en lezen we
 * het paginanummer van de `.pagedjs_page` waarop die kop landt. Zo hoeven we
 * niet te leunen op `target-counter`, dat in Paged.js 0.4.3 onbetrouwbaar is.
 * @param {Element} pagedRoot  De container met de Paged.js-output.
 */
function fillTocPageNumbers(pagedRoot) {
  const pages = Array.from(pagedRoot.querySelectorAll('.pagedjs_page'));
  for (const link of pagedRoot.querySelectorAll('.w4-toc-item a[href^="#"]')) {
    const span = link.querySelector('.w4-toc-page');
    if (!span) continue;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = findById(pagedRoot, id);
    const pageEl = target && target.closest('.pagedjs_page');
    if (!pageEl) {
      span.textContent = '';
      continue;
    }
    span.textContent =
      pageEl.getAttribute('data-page-number') || String(pages.indexOf(pageEl) + 1);
  }
}

/** Pagineer met Paged.js en open daarna het printvenster. */
async function exportPdf() {
  if (!markdownSource) return; // niks om te exporteren

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
    // Paged.js kent nu de pagina-indeling: schrijf de nummers in de TOC.
    fillTocPageNumbers(els.paged);
    window.print();
  } finally {
    els.print.disabled = false;
    els.print.textContent = 'Exporteer naar PDF';
  }
}

/**
 * Lees een gekozen/gesleept bestand in. Volledig client-side via FileReader;
 * er gaat niets naar een server. De bestandsnaam vult meteen de voorblad-titel
 * en verschijnt in de dropzone.
 * @param {File} file
 */
function loadFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    markdownSource = String(reader.result);
    els.title.value = filenameToTitle(file.name);
    els.dropzoneText.textContent = file.name;
    els.dropzone.classList.add('has-file');
    render();
  };
  reader.readAsText(file);
}

els.file.addEventListener('change', (e) => {
  loadFile(e.target.files[0]);
  e.target.value = ''; // zelfde bestand nogmaals kunnen kiezen
});

// Sleep een bestand op de dropzone.
els.dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  els.dropzone.classList.add('is-dragover');
});
for (const evt of ['dragleave', 'dragend', 'drop']) {
  els.dropzone.addEventListener(evt, () => els.dropzone.classList.remove('is-dragover'));
}
els.dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer && e.dataTransfer.files[0];
  if (file) {
    e.preventDefault();
    loadFile(file);
  }
});

/** Lokale datum van vandaag als YYYY-MM-DD (zonder tijdzone-verschuiving). */
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Datumveld start op vandaag en is pas actief als het vinkje aan staat.
els.date.value = todayISO();
els.dateToggle.addEventListener('change', () => {
  els.date.disabled = !els.dateToggle.checked;
  render();
});

// Herrender bij elke wijziging; goedkoop genoeg voor deze schaal.
for (const el of [els.title, els.subtitle, els.footer]) {
  el.addEventListener('input', render);
}
for (const el of [els.date, els.toc, ...document.querySelectorAll('input[name="pdf-cover"]')]) {
  el.addEventListener('change', render);
}
els.print.addEventListener('click', exportPdf);

render();
