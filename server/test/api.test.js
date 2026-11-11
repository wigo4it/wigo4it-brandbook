import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { createApp } from '../app.js';
import { openStore } from '../store.js';
import { hashPassword } from '../auth.js';
import { ALPHABET, normalizeId, newId } from '../ids.js';

let server, base, cookie;

before(async () => {
  const app = createApp({
    root: resolve(import.meta.dirname, '..', '..'),
    store: openStore(':memory:'),
    passwordHash: hashPassword('geheim'),
    sessionSecret: 'test-secret',
  });
  await new Promise((r) => { server = app.listen(0, '127.0.0.1', r); });
  base = `http://127.0.0.1:${server.address().port}`;
  const res = await fetch(`${base}/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'geheim' }),
  });
  cookie = res.headers.get('set-cookie').split(';')[0];
});

after(() => server.close());

const call = (path, { method = 'GET', body, auth = cookie } = {}) => {
  const headers = { 'content-type': 'application/json' };
  if (auth && !auth.includes('=')) headers.authorization = `Bearer ${auth}`;
  else if (auth) headers.cookie = auth;
  return fetch(`${base}${path}`, { method, headers, body: body && JSON.stringify(body) });
};

test('ids gebruiken alleen het afgesproken alfabet', () => {
  assert.equal(/[01oil]/.test(ALPHABET), false);
  for (let i = 0; i < 200; i++) assert.match(newId(), /^[23456789a-hjkmnp-z]{5}$/);
  assert.equal(normalizeId('AB3K9'), 'ab3k9');
  assert.equal(normalizeId('ab0k9'), null);
  assert.equal(normalizeId('abc'), null);
});

test('verkeerd wachtwoord geeft 401', async () => {
  const res = await fetch(`${base}/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'fout' }),
  });
  assert.equal(res.status, 401);
});

test('zonder login geen lijst of aanmaken', async () => {
  assert.equal((await call('/api/presentations', { auth: null })).status, 401);
  assert.equal((await call('/api/presentations', { method: 'POST', auth: null, body: { markdown: '# x' } })).status, 401);
});

test('aanmaken, ophalen, vervangen en verwijderen', async () => {
  const created = await call('/api/presentations', {
    method: 'POST', body: { markdown: '# Hallo', title: 'Test', options: { theme: 'x' } },
  });
  assert.equal(created.status, 201);
  const p = await created.json();
  assert.equal(p.visibility, 'private');
  assert.equal(p.owner, 'gedeeld');
  assert.match(p.url, new RegExp(`/present/${p.id}$`));

  const replaced = await (await call(`/api/presentations/${p.id}`, {
    method: 'PUT', body: { markdown: '# Nieuw', visibility: 'public' },
  })).json();
  assert.equal(replaced.id, p.id);
  assert.equal(replaced.visibility, 'public');

  const full = await (await call(`/api/presentations/${p.id.toUpperCase()}`)).json();
  assert.equal(full.markdown, '# Nieuw');
  assert.deepEqual(full.options, { theme: 'x' });

  const list = await (await call('/api/presentations')).json();
  assert.ok(list.some((x) => x.id === p.id));

  assert.equal((await call(`/api/presentations/${p.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await call(`/api/presentations/${p.id}`)).status, 404);
});

test('privé is 404 zonder login, publiek is open', async () => {
  const priv = await (await call('/api/presentations', { method: 'POST', body: { markdown: '# p' } })).json();
  const pub = await (await call('/api/presentations', { method: 'POST', body: { markdown: '# p', visibility: 'public' } })).json();
  assert.equal((await call(`/api/presentations/${priv.id}`, { auth: null })).status, 404);
  assert.equal((await call(`/api/presentations/${pub.id}`, { auth: null })).status, 200);
});

test('ongeldige invoer geeft 400', async () => {
  assert.equal((await call('/api/presentations', { method: 'POST', body: {} })).status, 400);
  assert.equal((await call('/api/presentations', { method: 'POST', body: { markdown: '# x', visibility: 'geheim' } })).status, 400);
});

test('API-sleutel werkt tot hij is ingetrokken', async () => {
  const key = await (await call('/api/keys', { method: 'POST', body: { name: 'Claude' } })).json();
  assert.match(key.secret, /^w4_/);

  const res = await call('/api/presentations', { method: 'POST', auth: key.secret, body: { markdown: '# via sleutel' } });
  assert.equal(res.status, 201);
  assert.equal((await call('/api/keys', { auth: key.secret })).status, 403);

  const keys = await (await call('/api/keys')).json();
  assert.ok(keys[0].lastUsedAt);
  assert.equal(keys[0].secret, undefined);

  assert.equal((await call(`/api/keys/${key.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await call('/api/presentations', { auth: key.secret })).status, 401);
});

test('/present/<id> serveert de viewer en normaliseert hoofdletters', async () => {
  const ok = await fetch(`${base}/present/ab3k9`);
  assert.equal(ok.status, 200);
  assert.match(await ok.text(), /deck-view/);
  const upper = await fetch(`${base}/present/AB3K9`, { redirect: 'manual' });
  assert.equal(upper.status, 301);
  assert.equal(upper.headers.get('location'), '/present/ab3k9');
});

test('repo-interne mappen worden niet geserveerd', async () => {
  for (const path of ['/server/app.js', '/tests/conftest.py', '/.git/config', '/docs/adr/0001-app-service-met-sqlite.md', '/docs/plan-v2.md']) {
    assert.equal((await fetch(`${base}${path}`)).status, 404, path);
  }
  assert.equal((await fetch(`${base}/index.html`)).status, 200);
});
