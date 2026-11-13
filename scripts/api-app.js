/* ============================================================
   API-pagina: sleutels beheren en het eigen adres in de voorbeelden.
   ============================================================ */
import { createKey, listKeys, loginHref, me, revokeKey } from './brandbook-api.js';

const status = document.getElementById('keys-status');
const manage = document.getElementById('keys-manage');
const form = document.getElementById('keys-form');
const nameInput = document.getElementById('keys-name');
const fresh = document.getElementById('keys-new');
const secret = document.getElementById('keys-secret');
const table = document.getElementById('keys-table');
const rows = document.getElementById('keys-rows');

const dateFormat = new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' });
const when = (iso) => (iso ? dateFormat.format(new Date(iso)) : 'nooit');

// De voorbeelden tonen het adres waar je nu bent.
for (const node of document.querySelectorAll('.js-base')) node.textContent = location.origin;

function row(key) {
  const revoke = Object.assign(document.createElement('button'), {
    type: 'button', className: 'w4-tool-btn is-secondary', textContent: 'Trek in',
  });
  revoke.addEventListener('click', async () => {
    if (!revoke.dataset.armed) {
      revoke.dataset.armed = '1';
      revoke.textContent = 'Zeker weten?';
      return;
    }
    await revokeKey(key.id);
    load();
  });
  const tr = document.createElement('tr');
  for (const text of [key.name, when(key.createdAt), when(key.lastUsedAt)]) {
    tr.append(Object.assign(document.createElement('td'), { textContent: text }));
  }
  const actions = Object.assign(document.createElement('div'), { className: 'w4-pres-actions' });
  actions.append(revoke);
  const td = document.createElement('td');
  td.append(actions);
  tr.append(td);
  return tr;
}

async function load() {
  const keys = await listKeys();
  rows.replaceChildren(...keys.map(row));
  table.hidden = keys.length === 0;
  status.textContent = keys.length ? '' : 'Nog geen sleutels.';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const key = await createKey(nameInput.value.trim());
    secret.textContent = key.secret;
    fresh.hidden = false;
    nameInput.value = '';
    load();
  } catch (error) {
    status.textContent = `Maken mislukt: ${error.message}`;
  }
});

const session = await me();
if (!session.available) {
  status.textContent = 'Sleutels beheer je op de brandbook-server, niet op deze kopie.';
} else if (!session.loggedIn) {
  status.replaceChildren('Je bent niet ingelogd. ');
  status.append(Object.assign(document.createElement('a'), { href: loginHref(), textContent: 'Log in' }), ' om sleutels te maken.');
} else {
  manage.hidden = false;
  load();
}
