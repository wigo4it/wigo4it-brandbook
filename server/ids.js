// Ids van permalinks: 5 tekens, kleine letters en cijfers zonder 0 1 o i l.
import { randomInt } from 'node:crypto';

export const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
export const ID_LENGTH = 5;
const ID_PATTERN = new RegExp(`^[${ALPHABET}]{${ID_LENGTH}}$`);

export function newId() {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) id += ALPHABET[randomInt(ALPHABET.length)];
  return id;
}

/** Normaliseert een opgevraagd id; geeft null als het geen geldig id is. */
export function normalizeId(raw) {
  const id = String(raw ?? '').toLowerCase();
  return ID_PATTERN.test(id) ? id : null;
}
