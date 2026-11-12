# Overdracht: van Bicep naar Terraform op de org-runners

Stand op 12 november 2026. Vervolg op `docs/handoff-v2.md`. Dit gaat over het verplaatsen van de infra van
Bicep naar Terraform en het deployen via GitHub Actions op de runners van de organisatie, als onderdeel van
PR #42.

## Besluiten

- **Terraform, geen Bicep.** Terraform is de standaard in de organisatie. `infra/main.bicep` gaat eruit.
- **Infra en runners horen in PR #42.** Die PR is nog niet gemerged, dus Bicep komt nooit in `main`.
- **Eigen titel en permalink per presentatie komen in een aparte PR**, gestapeld op `feature/v2-server`, en
  gaan direct na #42 naar `main`. Zie "Volgende PR" onderaan.
- **De resources blijven waar ze staan:** subscription `099-researchanddevelopment-rd`, RG `rg-brandbook`,
  Web App `wigo4it-brandbook`. Terraform **importeert** ze. Opnieuw aanmaken zou `/home/data/brandbook.db`
  weggooien, en daarmee alle gepubliceerde presentaties.
- **State in `st099rd`**, container `cont099tfstate`, key `brandbook.tfstate`, met `use_azuread_auth = true`
  (shared keys staan uit op dat account). Dit is dezelfde plek als bij Wiglowy. Werkt het niet vanaf de
  runners, dan is het alternatief een eigen storage account in `rg-brandbook`, dat we één keer met de hand
  aanmaken.
- **Identiteit:** `099-umi-owner-github` (managed identity in `rg-099-spoke-rd-shared`) via OIDC. Akkoord
  van Jeroen. Er komt geen eigen app-registratie, dus punt 2 uit `handoff-v2.md` vervalt.

## Hoe andere repo's het doen

| Repo | Wat we eruit halen |
| --- | --- |
| `inkomen-socrates-instructies` | Geen Terraform (AKS en `kubectl`). Wel het patroon voor workflows: `runs-on: { group: cee-runners-prod }`, actions uit `wigo4itnl-tooling/*`, en app-secrets per sleutel vanuit GitHub-secrets (een leeg secret overschrijft nooit een live waarde). |
| `inkomen-uitkeringen-api` (`provisioning/terraform/`) | Het Terraform-voorbeeld. Indeling `products/<product>/` met één `.tf` per resource en een eigen `configuration.yaml`, plus `configuration/configuration.yaml` met de backend per stage. `scripts/tf.sh` is de wrapper voor lokaal en CI. Terraform `~> 1.16`, `azurerm ~> 5.10`. De plan en apply staan in composite actions (`.github/actions/infra-plan`, `infra-apply`); het plan gaat als artifact van plan naar apply. Actions zijn **gepind op een commit-SHA** met de versie als commentaar. |
| `wiglowy` | Terraform in subscription 099 met state in `st099rd/cont099tfstate`, backend via `-backend-config` in `terraform/tf.ps1`, en `ARM_USE_OIDC=true`. Draait op `runs-on: self-hosted`. Laatste commit is van december 2024, dus het is niet zeker dat dit nu nog werkt. |

Voor brandbook nemen we de structuur en de wrapper van uitkeringen-api over, maar in de vorm van Wiglowy:
één product en één stage, zonder O/T/A/P en zonder Keycloak.

Actions die we gebruiken, uit `wigo4itnl-tooling` (stand 11-11-2026): `checkout` v7.0.1, `azure-login`
v3.1.0, `setup-node` v7.1.0, `setup-python` v7.1.0, `setup-terraform` v4.0.1, `upload-artifact` v7.0.2,
`download-artifact` v8.0.2, `azure-cli` v3.0.0. Pin ze op de SHA, zoals uitkeringen-api doet.

## Wat er staat (12 november 2026)

- **Federated credentials** op `099-umi-owner-github`:
  - `brandbook-main` → `repo:wigo4it/wigo4it-brandbook:ref:refs/heads/main`
  - `brandbook-pr` → `repo:wigo4it/wigo4it-brandbook:pull_request`
  - `brandbook-tmp-statetest` → `repo:wigo4it/wigo4it-brandbook:ref:refs/heads/test/tfstate-access`
    (**tijdelijk**, weghalen na de test)
- **Repo-secrets:** `AZURE_FEDERATED_CREDENTIAL_CLIENT_ID_099`, `AZURE_SUBSCRIPTION_ID_099`,
  `AZURE_TENANT_ID`. De namen volgen die van de andere repo's.
- **Testbranch `test/tfstate-access`** (vanaf `main`, worktree `.worktrees/tfstate-test`) met
  `.github/workflows/tfstate-test.yml`. Die probeert op `cee-runners-prod` en op `self-hosted` in te loggen,
  de rollen te tonen, een blob in `st099rd/cont099tfstate` te schrijven en te verwijderen, en de Web App
  op te vragen.

## Wat we geleerd hebben

1. **Geen runner pakt onze jobs op.** Run 43172693864 stond na meer dan vijf minuten nog op `queued`, op
   `cee-runners-prod` én op `self-hosted`, en is geannuleerd. Waarschijnlijk staat `wigo4it-brandbook` niet
   in de repository access van die runner-groepen. Nakijken kon niet: daarvoor mist het `gh`-token
   `admin:org`.
2. **`st099rd` is van buitenaf dicht.** De default action staat op `Deny`, zonder IP-regels, zonder
   VNet-regels en zonder private endpoint. Alleen `bypass: AzureServices` komt erdoor. Een runner kan er
   alleen bij als hij via een route binnenkomt die we niet kennen. Pas een echte run vanaf een runner geeft
   uitsluitsel.
3. **`099-umi-owner-github` laat geen rollen zien.** `az role assignment list --all` gaf niets terug. De
   rollen zitten mogelijk op management-groepniveau, buiten ons leesrecht. Nodig zijn minstens
   *Contributor* op `rg-brandbook` en *Storage Blob Data Contributor* op `cont099tfstate`. De testworkflow
   toont de rollen zodra hij draait.
4. **De standaard-subscription van de az-CLI lokaal is 097**, niet 099. Geef bij elke opdracht
   `--subscription` mee.
5. **Auto mode blokkeert** het aanmaken van federated credentials en het zetten van repo-secrets. Dat doet
   Jeroen zelf met `! bash <script>`. Plak lange `az`-opdrachten niet in de prompt: de regels breken af en
   de shell leest dan losse commando's. Zet ze in een script in de scratchpad.

## Volgende stappen

1. Een org-admin zet `wigo4it/wigo4it-brandbook` op *Organization settings → Actions → Runner groups →
   cee-runners-prod → Repository access*.
2. De testworkflow opnieuw draaien: `gh run rerun 43172693864` of een lege commit op `test/tfstate-access`.
   - Lukt dat: state in `st099rd`.
   - Faalt het op het netwerk: een eigen storage account in `rg-brandbook`, of een netwerkregel op
     `st099rd` vragen aan het platformteam.
   - Faalt het op rechten: rollen toekennen aan `099-umi-owner-github` (zie punt 3).
3. Opruimen: de branch `test/tfstate-access` (lokaal, remote en de worktree) en de credential
   `brandbook-tmp-statetest`.
4. Op `feature/v2-server`:
   - `provisioning/terraform/products/brandbook/` opzetten met `import`-blokken voor de RG, het plan en de
     Web App.
   - `scripts/tf.sh` toevoegen.
   - `ci-terraform.yml` (fmt, validate, plan op de PR) en `cd-infra.yml` (apply op `main`) toevoegen.
   - `azure.yml`, `ci.yml` en `static.yml` omzetten naar `cee-runners-prod` en `wigo4itnl-tooling`-actions.
   - De deploy-job zet `SESSION_SECRET` en `APP_PASSWORD_HASH` per sleutel uit GitHub-secrets. Daardoor
     hoeft Terraform ze niet te beheren.
   - `infra/` weghalen en `CLAUDE.md`, `docs/adr/0001` en `handoff-v2.md` bijwerken.

## Volgende PR: eigen titel en permalink

- De titel komt uit de front matter, anders uit de bestandsnaam van de markdown. De eigenaar kan hem
  wijzigen.
- `/present/<id>` heeft nu een vaste `<title>Wigo4it | Presentatie</title>` en geen `og:`-tags. Previews in
  Teams en Slack draaien geen JS, dus de server moet de titel en `og:title` zelf invoegen, op dezelfde plek
  als de `<base href>`.
- De permalink wordt een slug die de eigenaar kan wijzigen. Het id is nu willekeurig, 5 tekens
  (`server/ids.js`).
- Open vragen: blijft een oude slug doorverwijzen na een wijziging, welke tekens en welke maximale lengte
  zijn toegestaan, en blijft het korte id als vaste link werken?
