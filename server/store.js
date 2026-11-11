// Opslag van presentaties en API-sleutels in SQLite.
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { newId } from './ids.js';

export const SHARED_OWNER = 'gedeeld';
const VISIBILITIES = new Set(['public', 'private']);

const hashKey = (key) => createHash('sha256').update(key).digest('hex');

export function openStore(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS presentations (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      markdown TEXT NOT NULL,
      options TEXT NOT NULL DEFAULT '{}',
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      last_used_at TEXT
    );
  `);

  const row = (r) => r && {
    id: r.id, owner: r.owner, title: r.title, markdown: r.markdown,
    options: JSON.parse(r.options), visibility: r.visibility,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };

  return {
    get(id) {
      return row(db.prepare('SELECT * FROM presentations WHERE id = ?').get(id));
    },

    /** Presentaties die deze eigenaar mag beheren: eigen plus `gedeeld`. */
    list(owner) {
      return db.prepare(
        'SELECT * FROM presentations WHERE owner IN (?, ?) ORDER BY updated_at DESC',
      ).all(owner, SHARED_OWNER).map(row);
    },

    create(owner, { markdown, options = {}, visibility = 'private', title = '' }) {
      const now = new Date().toISOString();
      const insert = db.prepare(`INSERT OR IGNORE INTO presentations
        (id, owner, title, markdown, options, visibility, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      for (let attempt = 0; attempt < 10; attempt++) {
        const id = newId();
        const { changes } = insert.run(id, owner, title, markdown,
          JSON.stringify(options), visibility, now, now);
        if (changes) return this.get(id);
      }
      throw new Error('Geen vrij id gevonden');
    },

    update(id, fields) {
      const current = this.get(id);
      const next = { ...current, ...fields };
      db.prepare(`UPDATE presentations SET title = ?, markdown = ?, options = ?,
        visibility = ?, owner = ?, updated_at = ? WHERE id = ?`).run(
        next.title, next.markdown, JSON.stringify(next.options), next.visibility,
        next.owner, new Date().toISOString(), id);
      return this.get(id);
    },

    remove(id) {
      db.prepare('DELETE FROM presentations WHERE id = ?').run(id);
    },

    createKey(owner, name) {
      const secret = `w4_${randomBytes(24).toString('base64url')}`;
      const id = randomBytes(6).toString('hex');
      db.prepare(`INSERT INTO api_keys (id, owner, name, hash, created_at)
        VALUES (?, ?, ?, ?, ?)`).run(id, owner, name, hashKey(secret), new Date().toISOString());
      return { id, name, secret };
    },

    listKeys(owner) {
      return db.prepare(`SELECT id, name, created_at AS createdAt, last_used_at AS lastUsedAt
        FROM api_keys WHERE owner = ? ORDER BY created_at DESC`).all(owner)
        .map((k) => ({ ...k }));
    },

    revokeKey(owner, id) {
      return db.prepare('DELETE FROM api_keys WHERE id = ? AND owner = ?').run(id, owner).changes > 0;
    },

    /** Geeft de eigenaar van een geldige sleutel, of null. */
    ownerForKey(secret) {
      const hash = hashKey(secret);
      const key = db.prepare('SELECT id, owner FROM api_keys WHERE hash = ?').get(hash);
      if (!key) return null;
      db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?').run(new Date().toISOString(), key.id);
      return key.owner;
    },

    close() { db.close(); },
  };
}

export const isVisibility = (v) => VISIBILITIES.has(v);
