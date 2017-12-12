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
    port: 4200
  },
  auth0: {
    domain: 'landoftherair.auth0.com',
    client: 'U8bTIfByag72iLPYAf7LxXVrBDC0M-Ov',
    callbackUrl: 'http://localhost:4200',
    apiUrl: 'authidentifier'
  },
  deepstream: {
    url: 'ws://127.0.0.1:6020/deepstream'
  }
};
