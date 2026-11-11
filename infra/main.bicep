// Brandbook v2: één Linux App Service (B1) met de Node-server.
// Zie docs/adr/0001-app-service-met-sqlite.md.
//
// Uitrollen (resourcegroep bestaat al):
//   az deployment group create -g rg-brandbook -f infra/main.bicep \
//     -p sessionSecret=<random> appPasswordHash=<npm run hash-password>
// Secrets geef je mee op de commandline; ze staan nooit in de repo.

@description('Naam van de web app; bepaalt <naam>.azurewebsites.net.')
param appName string = 'wigo4it-brandbook'

param location string = resourceGroup().location

@description('Basisadres in permalinks. Leeg = het azurewebsites.net-adres.')
param publicBaseUrl string = ''

@secure()
@description('Willekeurige lange string om sessiecookies te ondertekenen.')
param sessionSecret string

@secure()
@description('Uitvoer van `npm run hash-password -- <wachtwoord>` in server/.')
param appPasswordHash string

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: 'plan-${appName}'
  location: location
  sku: { name: 'B1', tier: 'Basic' }
  kind: 'linux'
  properties: { reserved: true }
}

resource site 'Microsoft.Web/sites@2024-04-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|24-lts'
      appCommandLine: 'node server/server.js'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      healthCheckPath: '/api/me'
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'DATA_DIR', value: '/home/data' }
        { name: 'PUBLIC_BASE_URL', value: empty(publicBaseUrl) ? 'https://${appName}.azurewebsites.net' : publicBaseUrl }
        { name: 'SESSION_SECRET', value: sessionSecret }
        { name: 'APP_PASSWORD_HASH', value: appPasswordHash }
        // /home is de persistente schijf: daar staat de SQLite-database.
        { name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE', value: 'true' }
        // We deployen een kant-en-klaar pakket, inclusief node_modules.
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: 'false' }
      ]
    }
  }
}

output url string = 'https://${site.properties.defaultHostName}'
output name string = site.name
