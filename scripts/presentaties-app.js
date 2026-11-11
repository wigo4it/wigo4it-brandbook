/* ============================================================
   Mijn presentaties: lijst, link kopiëren, zichtbaarheid wisselen,
   bewerken in de deck-tool en verwijderen.
   ============================================================ */
import {
  deletePresentation, listPresentations, loginHref, me, updatePresentation,
} from './brandbook-api.js';

const status = document.getElementById('pres-status');
const table = document.getElementById('pres-table');
const rows = document.getElementById('pres-rows');

const dateFormat = new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' });

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function button(label, onClick, secondary = true) {
  const b = el('button', { type: 'button', className: `w4-tool-btn${secondary ? ' is-secondary' : ''}`, textContent: label });
  b.addEventListener('click', () => onClick(b));
  return b;
}

function row(p) {
  const visibilityLabel = p.visibility === 'public' ? 'Publiek' : 'Privé';
  const actions = el('div', { className: 'w4-pres-actions' },
    button('Kopieer link', async (b) => {
      await navigator.clipboard.writeText(p.url);
      b.textContent = 'Gekopieerd';
      setTimeout(() => { b.textContent = 'Kopieer link'; }, 1500);
    }),
    el('a', { className: 'w4-tool-btn is-secondary', href: `deck.html?id=${p.id}`, textContent: 'Bewerk' }),
    button(p.visibility === 'public' ? 'Maak privé' : 'Maak publiek', async () => {
      await updatePresentation(p.id, { visibility: p.visibility === 'public' ? 'private' : 'public' });
      load();
    }),
    button('Verwijder', async (b) => {
      // Geen confirm(): twee klikken op dezelfde knop is de bevestiging.
      if (b.dataset.armed) {
        await deletePresentation(p.id);
        load();
        return;
      }
      b.dataset.armed = '1';
      b.textContent = 'Zeker weten?';
    }),
  );

  return el('tr', {},
    el('td', {}, p.title || el('em', { textContent: 'Zonder titel' })),
    el('td', {}, el('a', { href: p.url, target: '_blank', rel: 'noopener', textContent: `/present/${p.id}` })),
    el('td', { textContent: visibilityLabel }),
    el('td', { textContent: dateFormat.format(new Date(p.updatedAt)) }),
    el('td', {}, actions),
  );
}

async function load() {
  try {
    const list = await listPresentations();
    rows.replaceChildren(...list.map(row));
    table.hidden = list.length === 0;
    status.textContent = list.length ? '' : 'Nog geen presentaties. Publiceer er een vanuit de deck-tool.';
  } catch (error) {
    status.textContent = `Laden mislukt: ${error.message}`;
  }
}

const session = await me();
if (!session.available) {
  status.textContent = 'Deze pagina werkt alleen op de brandbook-server.';
} else if (!session.loggedIn) {
  status.replaceChildren('Je bent niet ingelogd. ', el('a', { href: loginHref(), textContent: 'Log in' }), ' om je presentaties te zien.');
} else {
  load();
}
