/* ============================================================
   W4 mermaid-renderer
   Tekent de ```mermaid-blokken die pdf-builder.js als lege figures heeft
   neergezet. Het enige bestand dat mermaid kent.

   Drie dingen zitten hier bewust in:

   * Mermaid komt lazy binnen. De ESM-build splitst per diagramtype, dus
     pas bij het eerste diagram wordt er iets opgehaald en dan alleen de
     chunk van dat type. Wie een memo zonder diagrammen maakt, downloadt
     niets. Valt de CDN weg, dan faalt alleen de import en niet de tool.
   * De kleuren komen uit de custom properties in styles/w4.css. Het merk
     staat al op twee plekken (w4.css en tailwind-config.js); een derde
     kopie hier zou de volgende kleurwijziging stilletjes half doorvoeren.
   * De SVG wordt gecachet op de broncode. Elke toetsaanslag in het
     titelveld hertekent het document, en zonder cache dus ook elk diagram.
   ============================================================ */
import { normalizeDiagramSvg, reidSvg } from './pdf-builder.js';

const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11.16.1/dist/mermaid.esm.min.mjs';

/* Breedte waarop mermaid zijn diagrammen opmaakt: de tekstkolom van een A4,
   210mm min twee keer 18mm marge. Niet elk type meet zijn eigen inhoud op;
   gantt en pie kijken naar de breedte van de container waarin ze getekend
   worden. Zonder eigen container is dat document.body, en dan hangt de
   uitkomst af van hoe groot het browservenster toevallig staat. Een gantt
   werd zo op 1600px opgemaakt en daarna naar de kolom teruggeschaald, met
   onleesbare labels tot gevolg. */
const COLUMN_WIDTH = '174mm';

/** Broncode -> SVG-string. Leeg zolang er geen diagram getekend is. */
const svgCache = new Map();

/** Loopt door zodat elke render en elke plaatsing een eigen id houdt. */
let sequence = 0;

/** De import gebeurt één keer; ook een mislukking blijft staan. */
let mermaidPromise = null;

/** Lees een merkkleur uit styles/w4.css, met de canonieke waarde als vangnet. */
function brandColor(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value.trim() || fallback;
}

/**
 * Vertaal de merkkleuren naar mermaids theme-variabelen.
 *
 * Met `theme: 'base'` leidt mermaid veel af van een handvol basiskleuren, maar
 * niet alles: sequence, gantt en pie hebben hun eigen namen. Vandaar deze lijst.
 */
function themeVariables() {
  const lightGrey = brandColor('--light-grey', '#cfd6cc');
  const darkGreen = brandColor('--dark-green', '#005351');
  const darkBlue = brandColor('--dark-blue', '#434d8e');
  const softYellow = brandColor('--soft-yellow', '#e9eb86');
  const lightGreen = brandColor('--light-green', '#63cf92');
  const aubergine = brandColor('--aubergine', '#362c46');
  const brightRed = brandColor('--bright-red', '#f56e6d');
  const brightPink = brandColor('--bright-pink', '#bb55a9');

  const white = '#ffffff';
  // Zelfde zachte grijsgroen als de codeblokken in styles/pdf.css.
  const wash = '#f3f5f1';

  return {
    fontFamily: "'Raleway', system-ui, sans-serif",
    fontSize: '15px',
    background: white,
    textColor: aubergine,
    titleColor: darkGreen,
    lineColor: darkGreen,

    // Basis: vlakken licht, randen groen, tekst aubergine.
    primaryColor: lightGrey,
    primaryTextColor: aubergine,
    primaryBorderColor: darkGreen,
    secondaryColor: softYellow,
    secondaryTextColor: aubergine,
    secondaryBorderColor: darkGreen,
    tertiaryColor: lightGreen,
    tertiaryTextColor: aubergine,
    tertiaryBorderColor: darkGreen,

    // Flowchart, state, class, ER.
    mainBkg: lightGrey,
    nodeBorder: darkGreen,
    clusterBkg: wash,
    clusterBorder: lightGrey,
    edgeLabelBackground: white,
    attributeBackgroundColorOdd: white,
    attributeBackgroundColorEven: wash,

    // Notities, overal hetzelfde geel.
    noteBkgColor: softYellow,
    noteTextColor: aubergine,
    noteBorderColor: darkGreen,

    // Sequence.
    actorBkg: lightGrey,
    actorBorder: darkGreen,
    actorTextColor: aubergine,
    actorLineColor: darkGreen,
    signalColor: darkGreen,
    signalTextColor: aubergine,
    labelBoxBkgColor: softYellow,
    labelBoxBorderColor: darkGreen,
    labelTextColor: aubergine,
    loopTextColor: aubergine,
    activationBkgColor: lightGreen,
    activationBorderColor: darkGreen,
    sequenceNumberColor: white,

    // Gantt.
    sectionBkgColor: wash,
    altSectionBkgColor: white,
    sectionBkgColor2: lightGrey,
    taskBkgColor: lightGrey,
    taskBorderColor: darkGreen,
    taskTextColor: aubergine,
    taskTextDarkColor: aubergine,
    taskTextOutsideColor: aubergine,
    activeTaskBkgColor: lightGreen,
    activeTaskBorderColor: darkGreen,
    doneTaskBkgColor: darkGreen,
    doneTaskBorderColor: darkGreen,
    critBkgColor: brightRed,
    critBorderColor: darkGreen,
    gridColor: lightGrey,
    todayLineColor: brightRed,

    // Pie: de acht merkkleuren, daarna herhalen.
    pie1: darkGreen,
    pie2: softYellow,
    pie3: darkBlue,
    pie4: lightGreen,
    pie5: brightPink,
    pie6: lightGrey,
    pie7: brightRed,
    pie8: aubergine,
    pie9: darkGreen,
    pie10: softYellow,
    pie11: darkBlue,
    pie12: lightGreen,
    pieTitleTextColor: darkGreen,
    pieSectionTextColor: aubergine,
    pieStrokeColor: white,
    pieOuterStrokeColor: white,
  };
}

/**
 * Haal mermaid op en zet 'm klaar. Eén keer per pagina.
 *
 * Een mislukte import blijft gecachet: zonder dat zou elke toetsaanslag in het
 * instellingenpaneel opnieuw een dode CDN bevragen. Herstel = pagina verversen,
 * en dat is precies wat je bij een CDN-storing toch doet.
 */
function loadMermaid() {
  if (mermaidPromise) return mermaidPromise;

  mermaidPromise = (async () => {
    const module = await import(MERMAID_URL);
    const mermaid = module.default;

    // Mermaid meet de tekst op om de vakjes te maten. Is Raleway nog niet
    // binnen, dan meet hij een systeemfont en staan de labels scheef in hun
    // kader. Dus eerst de fonts.
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      // Geen bom-plaatje in de DOM en geen console.error bij een kapot
      // diagram: we tekenen onze eigen melding, en de CI-gate valt om op
      // console-errors.
      suppressErrorRendering: true,
      logLevel: 'fatal',
      theme: 'base',
      themeVariables: themeVariables(),
      // Labels als echte SVG-tekst in plaats van een foreignObject met HTML.
      // Tailwinds preflight en de .w4-doc-content-regels lekken zo'n
      // foreignObject in, het print minder voorspelbaar, en met <text> blijft
      // de tekst in de PDF selecteerbaar.
      flowchart: { htmlLabels: false, useMaxWidth: true },
      class: { htmlLabels: false, useMaxWidth: true },
    });

    return mermaid;
  })();

  // Niemand mag struikelen over een unhandled rejection; de aanroepers
  // vangen de fout zelf af.
  mermaidPromise.catch(() => {});
  return mermaidPromise;
}

/** De broncode van een figure, zoals collectDiagrams 'm heeft laten staan. */
function sourceOf(figure) {
  const pre = figure.querySelector('.w4-diagram-src');
  return pre ? pre.textContent.trim() : '';
}

/** Het onderschrift, voor het aria-label van de SVG. */
function captionOf(figure) {
  const cap = figure.querySelector('.w4-diagram-caption');
  return cap ? cap.textContent.trim() : '';
}

/** Zet een figure in een eindtoestand: pending eraf, nieuwe staat erop. */
function settle(figure, state) {
  figure.classList.remove('is-pending');
  figure.classList.add(state);
}

/**
 * Zet een melding onder de zichtbaar gebleven broncode. Bij een fout blijft de
 * bron staan, want zonder de code kan de auteur niet zien wat er mis is.
 */
function addNote(figure, text) {
  const note = document.createElement('p');
  note.className = 'w4-diagram-note';
  note.textContent = text;
  const body = figure.querySelector('.w4-diagram-body') || figure;
  body.appendChild(note);
}

/** Parse de SVG-string van mermaid tot een element. */
function parseSvg(svgText) {
  const template = document.createElement('template');
  template.innerHTML = String(svgText).trim();
  const svg = template.content.querySelector('svg');
  if (!svg) throw new Error('mermaid gaf geen SVG terug');
  return svg;
}

/**
 * Het vlak waarin mermaid zijn diagram opmaakt: buiten beeld, maar wel
 * gelayout, want er wordt in gemeten. Op kolombreedte, zie COLUMN_WIDTH.
 */
let measureHost = null;
function measureContainer() {
  if (measureHost && measureHost.isConnected) return measureHost;
  measureHost = document.createElement('div');
  measureHost.setAttribute('aria-hidden', 'true');
  measureHost.style.cssText =
    `position:absolute;left:-99999px;top:0;width:${COLUMN_WIDTH};`;
  document.body.appendChild(measureHost);
  return measureHost;
}

/** Teken één diagram, of pak 'm uit de cache. Geeft een SVG-string terug. */
async function toSvg(mermaid, code) {
  const cached = svgCache.get(code);
  if (cached) return cached;
  const { svg } = await mermaid.render(
    `w4-mermaid-${++sequence}`,
    code,
    measureContainer()
  );
  svgCache.set(code, svg);
  return svg;
}

/**
 * Vul elke nog lege diagram-figure in een container.
 *
 * Doet niets als er geen diagrammen zijn, dus ook geen netwerkverkeer. Faalt
 * het laden van mermaid, dan vallen alle figures terug op een gewoon codeblok.
 * Faalt één diagram, dan krijgt alleen dat diagram een foutmelding en gaat de
 * rest gewoon door.
 *
 * @param {Element} container
 * @returns {Promise<number>} Aantal getekende diagrammen.
 */
export async function renderDiagrams(container) {
  const figures = Array.from(container.querySelectorAll('.w4-diagram.is-pending'));
  if (!figures.length) return 0;

  let mermaid;
  try {
    mermaid = await loadMermaid();
  } catch {
    for (const figure of figures) {
      settle(figure, 'is-fallback');
      addNote(figure, 'Diagram niet geladen; hieronder staat de broncode.');
    }
    return 0;
  }

  let drawn = 0;
  for (const figure of figures) {
    const code = sourceOf(figure);
    if (!code) {
      settle(figure, 'is-error');
      addNote(figure, 'Leeg mermaid-blok.');
      continue;
    }

    try {
      const svg = parseSvg(await toSvg(mermaid, code));
      normalizeDiagramSvg(svg, { label: captionOf(figure) });
      // Uniek per plaatsing: preview en Paged-output staan tegelijk in de
      // pagina en mogen elkaars pijlpunten niet pakken.
      reidSvg(svg, `w4d${++sequence}`);

      const body = figure.querySelector('.w4-diagram-body');
      body.replaceChildren(svg);
      settle(figure, 'is-drawn');
      drawn++;
    } catch (err) {
      settle(figure, 'is-error');
      addNote(figure, `Diagram kan niet getekend worden: ${errorText(err)}`);
    }
  }
  return drawn;
}

/** Mermaids melding, teruggebracht tot iets wat in een document past. */
function errorText(err) {
  const text = (err && err.message) || String(err);
  return text.replace(/\s+/g, ' ').trim().slice(0, 300);
}

/** Zitten er ongetekende diagrammen in deze container? */
export function hasPendingDiagrams(container) {
  return !!container.querySelector('.w4-diagram.is-pending');
}
