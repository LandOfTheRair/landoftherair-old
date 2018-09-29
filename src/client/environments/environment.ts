// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  server: {
    domain: 'localhost',
    protocol: 'http',
    wsProtocol: 'ws',
    port: 3303,
    silentExt: 'dev'
  },
  client: {
    domain: 'localhost',
    protocol: 'http',
    port: 4567
  },
  auth0: {
    domain: 'landoftherair.auth0.com',
    client: 'U8bTIfByag72iLPYAf7LxXVrBDC0M-Ov',
    callbackUrl: 'http://localhost:4567',
    apiUrl: 'authidentifier'
  },
  stripe: {
    key: 'pk_test_TNxhxgcsao9B4ouQwRXeUnmm'
  },
  rollbar: {
    token: ''
  },
  assetHashes: {
    creatures: 0,
    decor: 0,
    effects: 0,
    items: 0,
    swimming: 0,
    terrain: 0,
    walls: 0
  },
  version: 'localdev'
};
