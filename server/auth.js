// Identiteit. Fase 1: één wachtwoord, eigenaar is altijd `gedeeld`.
// Fase 2 (Entra via Easy Auth) raakt alleen `currentOwner`: lees dan de
// header `x-ms-client-principal-id` en geef die als eigenaar terug.
import { createHmac, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';
import { SHARED_OWNER } from './store.js';

export const SESSION_COOKIE = 'w4_session';
const SESSION_DAYS = 14;

/** Maakt `salt:hash` voor de app setting APP_PASSWORD_HASH. */
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 32).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof password !== 'string') return false;
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

const sign = (value, secret) => createHmac('sha256', secret).update(value).digest('base64url');

export function makeSession(owner, secret) {
  const payload = Buffer.from(JSON.stringify({
    owner, exp: Date.now() + SESSION_DAYS * 864e5,
  })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

function readSession(token, secret) {
  if (!token) return null;
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return null;
  const a = Buffer.from(mac), b = Buffer.from(sign(payload, secret));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const { owner, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return exp > Date.now() ? owner : null;
}

function cookie(req, name) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

/** Wie doet dit verzoek? `{ owner, via }` of null als niet ingelogd. */
export function currentOwner(req, { store, sessionSecret }) {
  const bearer = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1];
  if (bearer) {
    const owner = store.ownerForKey(bearer);
    return owner ? { owner, via: 'key' } : null;
  }
  const owner = readSession(cookie(req, SESSION_COOKIE), sessionSecret);
  return owner ? { owner, via: 'session' } : null;
}

/** Mag deze eigenaar een presentatie van `presentationOwner` beheren? */
export const canManage = (owner, presentationOwner) =>
  owner === presentationOwner || presentationOwner === SHARED_OWNER;

export { SHARED_OWNER };
