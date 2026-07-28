/* ============================================================
   W4 Asset-manifest
   Eén ingang naar assets.json voor alles wat op de site iets met
   img/ doet: de catalogus-pagina's (logos, icons, shapes, photos) en
   de deck-tool, die er de shape:/icon:-tokens tegen controleert.

   Het manifest wordt gegenereerd door scripts/generate-assets.py en
   is daarmee de enige plek waar de bestandslijst staat. Voeg je een
   asset toe aan img/, draai dan dat script; de pagina's volgen
   vanzelf. De CI faalt als het manifest achterloopt.

   Let op: dit haalt een bestand op, dus de pagina moet geserveerd
   worden. Via file:// blokkeert de browser de fetch en krijg je een
   lege galerij. Draai een static server in de repo-root.
   ============================================================ */

/** Eén keer ophalen per pagina, ook als meerdere modules erom vragen. */
let pending = null;

/**
 * Haal het manifest op. Herhaalde aanroepen delen dezelfde fetch.
 * @param {string} [url] Pad naar assets.json, relatief aan de pagina.
 * @returns {Promise<object>} Het manifest.
 */
export function loadAssets(url = 'assets.json') {
  if (!pending) {
    pending = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`assets.json: HTTP ${response.status}`);
      return response.json();
    });
  }
  return pending;
}

/** De categorie met dit id, of null. */
export function category(manifest, id) {
  const categories = (manifest && manifest.categories) || [];
  return categories.find((entry) => entry.id === id) || null;
}

/**
 * Bestandsnamen binnen een categorie, in manifest-volgorde.
 * @param {object} manifest
 * @param {string} id       Categorie-id: icons, shapes, photos, logos.
 * @returns {string[]}      Bijvoorbeeld ['Aarde.svg', 'Alarm.svg', ...].
 */
export function files(manifest, id) {
  const found = category(manifest, id);
  return found ? found.assets.map((asset) => asset.file) : [];
}

/**
 * Namen zonder extensie, ontdubbeld. Dat is precies wat een deck-token
 * gebruikt: `shape:ring` verwijst naar img/shapes/ring.svg. Shapes die
 * zowel als SVG als PNG bestaan leveren dus één naam op.
 * @param {object} manifest
 * @param {string} id
 * @param {string} [format] Filter op format, bijvoorbeeld 'svg'.
 * @returns {string[]}
 */
export function names(manifest, id, format = '') {
  const found = category(manifest, id);
  if (!found) return [];
  const out = [];
  for (const asset of found.assets) {
    if (format && asset.format !== format) continue;
    const stem = asset.file.replace(/\.[^.]+$/, '');
    if (!out.includes(stem)) out.push(stem);
  }
  return out;
}

/** Levenshtein-afstand tussen twee strings. */
function distance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i += 1) {
    const current = [i + 1];
    for (let j = 0; j < b.length; j += 1) {
      const cost = a[i] === b[j] ? 0 : 1;
      current[j + 1] = Math.min(current[j] + 1, previous[j + 1] + 1, previous[j] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * De dichtstbijzijnde kandidaat bij een vermoedelijke typefout, of een lege
 * string als niets in de buurt komt. De drempel schaalt mee met de lengte:
 * bij een korte naam mag er één letter mis zijn, bij een lange naam meer.
 * Zonder die grens zou elke onzin-waarde een suggestie krijgen, en dat is
 * verwarrender dan geen suggestie.
 * @param {string} value
 * @param {string[]} candidates
 * @returns {string}
 */
export function suggest(value, candidates = []) {
  const needle = String(value).toLowerCase();
  if (!needle) return '';

  const limit = Math.max(1, Math.floor(needle.length / 3));
  let best = '';
  let bestScore = Infinity;
  for (const candidate of candidates) {
    const score = distance(needle, String(candidate).toLowerCase());
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return bestScore <= limit ? best : '';
}
