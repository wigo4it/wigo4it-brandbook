// Start de brandbook-server. Configuratie via omgevingsvariabelen:
//   PORT               poort (App Service zet die zelf)
//   DATA_DIR           map voor de SQLite-database (Azure: /home/data)
//   APP_PASSWORD_HASH  uitvoer van `npm run hash-password -- <wachtwoord>`
//   SESSION_SECRET     willekeurige lange string om sessies te ondertekenen
//   PUBLIC_BASE_URL    basisadres in permalinks, bv. https://brandbook.wigo4it.nl
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createApp } from './app.js';
import { openStore } from './store.js';

const here = dirname(fileURLToPath(import.meta.url));
const env = process.env;

if (!env.SESSION_SECRET) {
  console.error('SESSION_SECRET ontbreekt');
  process.exit(1);
}

const store = openStore(join(resolve(env.DATA_DIR ?? join(here, 'data')), 'brandbook.db'));
const app = createApp({
  root: resolve(here, '..'),
  store,
  passwordHash: env.APP_PASSWORD_HASH,
  sessionSecret: env.SESSION_SECRET,
  baseUrl: env.PUBLIC_BASE_URL ?? '',
  secureCookies: env.NODE_ENV === 'production',
});

app.set('trust proxy', 1);
const port = Number(env.PORT ?? 8080);
app.listen(port, () => console.log(`Brandbook op http://localhost:${port}`));
