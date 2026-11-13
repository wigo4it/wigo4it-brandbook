# Plan: Brandbook v2.0

Termen staan in `CONTEXT.md`, de hostingkeuze in `docs/adr/0001-app-service-met-sqlite.md`.

## Besluiten

- **Hosting:** Azure App Service (Linux, B1), één Node/Express-app die de statische site, de API, `/present/<id>` en het inloggen serveert. Opslag in SQLite op `/home`. Eerst op `*.azurewebsites.net`, later een custom domein, met een redirect vanaf het oude adres. Het basisadres komt uit `PUBLIC_BASE_URL`.
- **Presentatie** = markdown + paneelopties, bij elke weergave gerenderd door `deck-view.html` met de actuele builder.
- **Permalink:** `/present/<id>`, 5 tekens uit `23456789abcdefghjkmnpqrstuvwxyz`, hoofdletterongevoelig. Het id blijft gelijk bij vervangen.
- **Login, fase 1:** één wachtwoord (app setting, gehasht vergeleken) geeft een sessiecookie. Eigenaar is altijd `gedeeld`.
- **Login, fase 2 (alleen voorbereiden):** Entra via Easy Auth. Eigenaar wordt de Entra object-id. `gedeeld` blijft bestaan en is toegankelijk voor iedere ingelogde gebruiker, met de actie "overnemen". Het wachtwoord-inloggen gaat dan uit. De code leest de identiteit via één functie `currentOwner(req)`, zodat fase 2 alleen die functie raakt.
- **Zichtbaarheid:** publiek (iedereen met de link) of privé (alleen de eigenaar; bij `gedeeld` iedere ingelogde gebruiker).
- **API:** REST met API-sleutels (`Authorization: Bearer w4_…`, alleen de hash wordt opgeslagen, met naam, laatst-gebruikt en intrekken). Geen eigen CLI: curl-voorbeelden in `api.html` en in de skill.
- **GitHub Pages** blijft draaien tot Azure live en getest is, en gaat daarna uit.

## API

| Methode | Pad | Wat |
|---|---|---|
| POST | `/api/presentations` | `{markdown, options, visibility, title?}` → `{id, url}` |
| GET | `/api/presentations` | lijst van de eigen presentaties (plus `gedeeld`) |
| GET | `/api/presentations/:id` | bron; privé alleen voor bevoegden |
| PUT | `/api/presentations/:id` | vervangen (bron, opties, zichtbaarheid) |
| DELETE | `/api/presentations/:id` | verwijderen |
| POST/GET/DELETE | `/api/keys` | API-sleutels beheren (alleen via sessie) |
| POST | `/login`, `/logout` | wachtwoordsessie |

Een privé presentatie geeft voor onbevoegden 404, niet 403. Zo lekt niet of een id bestaat.

## Fasen

### 1. Server en opslag (`server/`)
- Express-app: statische root, `/present/:id` → `deck-view.html`, API en sessies. SQLite-tabellen `presentations` (id, owner, title, markdown, options, visibility, created/updated) en `api_keys`.
- Id-generator met botsingscontrole.
- `package.json` alleen voor `server/`. De statische site blijft zonder build-stap.

### 2. Frontend
- `deck-view.html`: bron uit `/api/presentations/:id` als die op `/present/<id>` staat, anders zoals nu uit `localStorage`.
- `deck.html`: knoppen Publiceer/Vervang met keuze publiek/privé, en de permalink tonen.
- Nieuwe tabs in `tool-nav.js`: `presentaties.html` (lijst, link kopiëren, openen in tool, verwijderen) en `api.html` (curl-readme + sleutelbeheer). Ook toevoegen aan `activeKey()` in `nav.js`.
- `nav.js`: een inlog/uitlog-element rechts, geen extra nav-item.
- `login.html` met alleen het wachtwoordveld.

### 3. Infra en deploy
- Bicep in `infra/`: App Service Plan B1 Linux, Web App (Node LTS), app settings (`APP_PASSWORD_HASH`, `SESSION_SECRET`, `PUBLIC_BASE_URL`), backup van `/home/data`.
- `static.yml` → deploy naar App Service na de CI-gate. In de deploy de skill-zip genereren uit `skills/wigo4it-huisstijl/`. De ingecheckte zip verwijderen.
- Subscription en resourcegroep invullen bij de uitrol (staan bewust niet in de repo).

### 4. Tests
- De bestaande Playwright-gate draait tegen de Express-server in plaats van `http.server`.
- API-tests (pytest + requests of node:test): CRUD, het id-formaat, privé → 404 zonder login, ingetrokken sleutel → 401, vervangen houdt het id.
- E2E: inloggen, publiceren, permalink openen in een schone context (publiek ok, privé geblokkeerd).

### 5. Skill (v2.0.0)
1. `wigo4it-claude-skills`: feature branch, update van `SKILL.md` (+ `version: 2.0.0`), nieuwe `references/api.md`: publiceren via curl als `W4_BRANDBOOK_KEY` aanwezig is, standaard privé, permalink teruggeven. PR.
2. Na de merge kopiëren naar `~/.claude/skills/wigo4it-huisstijl`.
3. `ProductManagement/.agents/skills/wigo4it-huisstijl`: branch + PR.
4. `brandbook/skills/wigo4it-huisstijl`: meenemen in de v2-branch.

### 6. `index.html`: sectie "Werk met AI"
- Download-knop (`/skills/wigo4it-huisstijl.zip`), versie en een overzicht van de mogelijkheden: decks en PDF's in de huisstijl, kennis van layouts/kleuren/assets, direct publiceren met permalink.

### 7. Documentatie
- `CLAUDE.md` (hosting, server, deploy, tests), `README.md`, `deck-syntax.html` (publiceren), `design-system.html` als er nieuwe UI-patronen bijkomen.

## Open punten voor de uitrol
- Wie maakt de resourcegroep aan, en wie beheert het wachtwoord?
- Hoe lang moeten back-ups bewaard blijven?
- Wanneer gaat het custom domein in, en wie zet het DNS-record?
