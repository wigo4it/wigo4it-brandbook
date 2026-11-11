// De brandbook-app: statische site, /present/<id>, inloggen en de API.
import express from 'express';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { normalizeId } from './ids.js';
import { isVisibility } from './store.js';
import {
  SESSION_COOKIE, SHARED_OWNER, canManage, currentOwner, makeSession, verifyPassword,
} from './auth.js';

// Mappen in de repo die geen onderdeel van de site zijn.
const PRIVATE_PATHS = /^\/(server|tests|infra|tmp|node_modules|docs\/adr)(\/|$)|^\/\./;
const MAX_MARKDOWN = 1_000_000;

export function createApp({ root, store, passwordHash, sessionSecret, baseUrl = '', secureCookies = false }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false }));

  const who = (req) => currentOwner(req, { store, sessionSecret });
  const permalink = (req, id) => `${baseUrl || `${req.protocol}://${req.get('host')}`}/present/${id}`;
  const summary = (req, p) => ({
    id: p.id, title: p.title, visibility: p.visibility, owner: p.owner,
    createdAt: p.createdAt, updatedAt: p.updatedAt, url: permalink(req, p.id),
  });

  const requireLogin = (req, res, next) => {
    const user = who(req);
    if (!user) return res.status(401).json({ error: 'Niet ingelogd' });
    req.user = user;
    next();
  };

  /** Zoekt de presentatie op en controleert beheerrechten; 404 als dat niet mag. */
  const manageable = (req, res, next) => {
    const id = normalizeId(req.params.id);
    const p = id && store.get(id);
    if (!p || !canManage(req.user.owner, p.owner)) return res.status(404).json({ error: 'Niet gevonden' });
    req.presentation = p;
    next();
  };

  function validate(body, { partial }) {
    const out = {};
    if (body.markdown !== undefined || !partial) {
      if (typeof body.markdown !== 'string' || !body.markdown.trim()) return { error: 'markdown ontbreekt' };
      if (body.markdown.length > MAX_MARKDOWN) return { error: 'markdown is te groot' };
      out.markdown = body.markdown;
    }
    if (body.options !== undefined) {
      if (typeof body.options !== 'object' || Array.isArray(body.options) || !body.options) return { error: 'options moet een object zijn' };
      out.options = body.options;
    }
    if (body.visibility !== undefined) {
      if (!isVisibility(body.visibility)) return { error: "visibility moet 'public' of 'private' zijn" };
      out.visibility = body.visibility;
    }
    if (body.title !== undefined) out.title = String(body.title).slice(0, 200);
    return { value: out };
  }

  // --- Inloggen ---------------------------------------------------------
  app.post('/login', (req, res) => {
    if (!verifyPassword(req.body?.password, passwordHash)) {
      return res.status(401).json({ error: 'Onjuist wachtwoord' });
    }
    res.cookie(SESSION_COOKIE, makeSession(SHARED_OWNER, sessionSecret), {
      httpOnly: true, sameSite: 'lax', secure: secureCookies, maxAge: 14 * 864e5, path: '/',
    });
    res.json({ owner: SHARED_OWNER });
  });

  app.post('/logout', (req, res) => {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/me', (req, res) => {
    const user = who(req);
    res.json(user ? { loggedIn: true, owner: user.owner } : { loggedIn: false });
  });

  // --- Presentaties -----------------------------------------------------
  // Bekijken: publiek voor iedereen, privé alleen voor wie mag beheren.
  app.get('/api/presentations/:id', (req, res) => {
    const id = normalizeId(req.params.id);
    const p = id && store.get(id);
    const user = who(req);
    const allowed = p && (p.visibility === 'public' || (user && canManage(user.owner, p.owner)));
    if (!allowed) return res.status(404).json({ error: 'Niet gevonden' });
    res.json({ ...summary(req, p), markdown: p.markdown, options: p.options });
  });

  app.get('/api/presentations', requireLogin, (req, res) => {
    res.json(store.list(req.user.owner).map((p) => summary(req, p)));
  });

  app.post('/api/presentations', requireLogin, (req, res) => {
    const { value, error } = validate(req.body ?? {}, { partial: false });
    if (error) return res.status(400).json({ error });
    const p = store.create(req.user.owner, value);
    res.status(201).location(`/api/presentations/${p.id}`).json(summary(req, p));
  });

  app.put('/api/presentations/:id', requireLogin, manageable, (req, res) => {
    const { value, error } = validate(req.body ?? {}, { partial: true });
    if (error) return res.status(400).json({ error });
    res.json(summary(req, store.update(req.presentation.id, value)));
  });

  app.delete('/api/presentations/:id', requireLogin, manageable, (req, res) => {
    store.remove(req.presentation.id);
    res.status(204).end();
  });

  // --- API-sleutels (alleen via een browsersessie) ----------------------
  const sessionOnly = (req, res, next) => (req.user.via === 'session'
    ? next() : res.status(403).json({ error: 'Sleutels beheer je in de browser' }));

  app.get('/api/keys', requireLogin, sessionOnly, (req, res) => res.json(store.listKeys(req.user.owner)));

  app.post('/api/keys', requireLogin, sessionOnly, (req, res) => {
    const name = String(req.body?.name ?? '').trim().slice(0, 100);
    if (!name) return res.status(400).json({ error: 'name ontbreekt' });
    res.status(201).json(store.createKey(req.user.owner, name));
  });

  app.delete('/api/keys/:id', requireLogin, sessionOnly, (req, res) => (
    store.revokeKey(req.user.owner, req.params.id)
      ? res.status(204).end() : res.status(404).json({ error: 'Niet gevonden' })));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Onbekend endpoint' }));

  // --- Site -------------------------------------------------------------
  // deck-view.html gebruikt relatieve paden (styles/…, scripts/…). Onder
  // /present/<id> zouden die naar /present/styles/… wijzen; een <base> zet ze
  // terug op de root. Of de presentatie bestaat, beslist de viewer via de API.
  const viewer = () => readFileSync(join(root, 'deck-view.html'), 'utf8')
    .replace('<head>', '<head>\n  <base href="/" />');
  app.get('/present/:id', (req, res) => {
    const id = normalizeId(req.params.id);
    if (id && id !== req.params.id) return res.redirect(301, `/present/${id}`);
    res.status(id ? 200 : 404).type('html').send(viewer());
  });

  app.use((req, res, next) => (PRIVATE_PATHS.test(req.path) ? res.status(404).end() : next()));
  app.use(express.static(root, { dotfiles: 'deny', extensions: ['html'] }));

  return app;
}
