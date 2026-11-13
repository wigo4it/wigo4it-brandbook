# App Service met SQLite in plaats van Static Web Apps

Brandbook v2 krijgt een backend om presentaties op te slaan. We hosten op één Azure App Service (Linux, B1) met een Node-server die zowel de statische site als de API serveert, en bewaren presentaties in een SQLite-bestand op de persistente schijf. Static Web Apps + Functions + Table/Blob was het alternatief. Dat is iets goedkoper, maar het zijn drie resources met een eigen lokaal emulatieverhaal, en je hebt de Standard-tier nodig om aan onze eigen Entra-tenant te koppelen. Easy Auth op App Service kan dat op elke tier.

## Gevolgen

- SQLite vereist één instance. Bij 3–5 gebruikers per dag is dat geen probleem. Schalen betekent overstappen op Azure SQL of Postgres.
- Back-up van het databasebestand moeten we zelf regelen.
