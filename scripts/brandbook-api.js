/* ============================================================
   Client voor de brandbook-API (server/app.js).
   Eén plek voor fetch, foutafhandeling en de vraag "ben ik ingelogd?".
   Draait de site zonder server (file:// of een kale static host), dan
   geeft me() gewoon "niet ingelogd" en werken de tools zoals vroeger.
   ============================================================ */

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.error || `Fout ${response.status}`);
  return data;
}

/** `{loggedIn, owner}`; zonder bereikbare API altijd niet ingelogd. */
export async function me() {
  try {
    const response = await fetch('/api/me', { credentials: 'same-origin' });
    if (!response.ok) return { loggedIn: false, available: false };
    return { ...(await response.json()), available: true };
  } catch {
    return { loggedIn: false, available: false };
  }
}

export const login = (password) => request('/login', { method: 'POST', body: { password } });
export const logout = () => request('/logout', { method: 'POST' });

export const listPresentations = () => request('/api/presentations');
export const getPresentation = (id) => request(`/api/presentations/${encodeURIComponent(id)}`);
export const createPresentation = (data) => request('/api/presentations', { method: 'POST', body: data });
export const updatePresentation = (id, data) =>
  request(`/api/presentations/${encodeURIComponent(id)}`, { method: 'PUT', body: data });
export const deletePresentation = (id) =>
  request(`/api/presentations/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const listKeys = () => request('/api/keys');
export const createKey = (name) => request('/api/keys', { method: 'POST', body: { name } });
export const revokeKey = (id) => request(`/api/keys/${encodeURIComponent(id)}`, { method: 'DELETE' });

/** Link naar de loginpagina die daarna terugkeert naar de huidige pagina. */
export function loginHref() {
  return `/login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
}

/** Id uit /present/<id>, of null. */
export function presentationIdFromPath(pathname = location.pathname) {
  const match = /\/present\/([a-z0-9]{5})\/?$/i.exec(pathname);
  return match ? match[1].toLowerCase() : null;
}
