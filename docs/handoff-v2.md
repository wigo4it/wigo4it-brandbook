# Overdracht: Brandbook v2.0

Stand op 11 november 2026. Achtergrond: `docs/plan-v2.md` (plan en besluiten), `CONTEXT.md` (termen),
`docs/adr/0001-app-service-met-sqlite.md` (hostingkeuze).

## Wat er staat

| Onderdeel | Status |
| --- | --- |
| Server (`server/`): API, wachtwoordlogin, API-sleutels, `/present/<id>` | Klaar, 9 node-tests groen |
| Frontend: Publiceer/Vervang in `deck.html`, `presentaties.html`, `api.html`, `login.html`, inlogknop in de nav | Klaar |
| Browsergate draait tegen de Node-server, plus e2e-tests voor publiceren (`tests/test_present.py`) | Klaar, 291 tests groen (één eenmalige timeout in `test_deck_builder.py`, slaagt bij herhalen) |
| Azure: `rg-brandbook` (West Europe), App Service Plan B1 + Web App `wigo4it-brandbook`, Node 24 | Uitgerold via `infra/main.bicep` |
| Eerste deploy | Handmatig met `az webapp deploy`; rooktest geslaagd (login, publiceren, verwijderen, interne mappen 404) |
| Sectie "Werk met AI" op `index.html` met skill-download | Klaar |
| Skill v2.0.0 | Bron-PR wigo4it/wigo4it-claude-skills#20, kopie-PR wigo4it/ProductManagement#1, `~/.claude/skills/` bijgewerkt, kopie in deze repo bijgewerkt |
| Brandbook-branch `feature/v2-server` | Gepusht, PR open (zie onder) |

Live: https://wigo4it-brandbook.azurewebsites.net. Deze versie draait vanaf de branch, niet vanaf `main`.

## Wat nog moet (mensenwerk)

1. **Wachtwoord.** Er staat een tijdelijk wachtwoord in Azure. Dat staat lokaal in de scratchpad van
   deze sessie (`brandbook-wachtwoord.txt`). Kies een eigen wachtwoord en zet het zo:
   ```bash
   cd server && HASH=$(npm run -s hash-password -- '<nieuw wachtwoord>')
   az webapp config appsettings set -g rg-brandbook -n wigo4it-brandbook --settings APP_PASSWORD_HASH="$HASH"
   ```
2. **GitHub-deploy.** `.github/workflows/azure.yml` verwacht de secrets `AZURE_CLIENT_ID`,
   `AZURE_TENANT_ID` en `AZURE_SUBSCRIPTION_ID`. Daarvoor is een app-registratie nodig met een
   federated credential voor `repo:wigo4it/wigo4it-brandbook:ref:refs/heads/main` en de rol
   *Website Contributor* op `rg-brandbook`. Die heb ik niet mogen aanmaken. Tot dan: handmatig
   deployen met `scripts/package-app.sh app.zip` en `az webapp deploy -g rg-brandbook -n wigo4it-brandbook --src-path app.zip --type zip`.
3. **Merge-volgorde.** Eerst claude-skills#20, dan ProductManagement#1, dan de brandbook-PR.
4. **GitHub Pages uitzetten** als Azure de enige plek is: `static.yml` verwijderen en Pages uitzetten
   in de repo-instellingen. Op Pages werkt publiceren niet. Wel komt er een 404 op `/api/me` in de console, maar de pagina's werken verder.
5. **Back-ups** van `/home/data/brandbook.db`: nog niet ingericht. Kies een bewaartermijn; App
   Service-backup heeft een storage account nodig.
6. **Custom domein** later: DNS-record, managed certificaat, `PUBLIC_BASE_URL` aanpassen en een
   redirect vanaf `azurewebsites.net` zodat oude permalinks blijven werken.

## Fase 2: Entra SSO (voorbereid, niet gebouwd)

- Easy Auth aanzetten op de Web App met de eigen tenant, anonieme toegang toestaan (publieke links).
- In `server/auth.js` → `currentOwner()`: de header `x-ms-client-principal-id` lezen en als eigenaar
  teruggeven. Het wachtwoord-inloggen gaat dan uit.
- `gedeeld` blijft bestaan voor iedere ingelogde gebruiker. De actie "overnemen" (eigenaar van
  `gedeeld` naar de gebruiker) bestaat nog niet. `store.update()` kan `owner` al zetten, er ontbreekt alleen een endpoint en een knop.
- Bestaande API-sleutels horen bij `gedeeld` en blijven dat.

## Aandachtspunten

- `node:sqlite` is in Node 22 nog experimenteel en geeft daar een waarschuwing. Op Azure draait Node 24.
- Bicep opnieuw uitrollen zonder `sessionSecret` en `appPasswordHash` faalt. Met nieuwe waarden
  logt iedereen uit.
- SQLite vraagt om één instance. Niet uitschalen.
- De skill-kopieën liepen al uit elkaar: de brandbook-kopie was nieuwer (mermaid). Die is nu de
  basis van v2.0.0 in alle vier de plekken.
