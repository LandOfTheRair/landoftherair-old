export const environment = {
  production: true,
  server: {
    domain: 'server.rair.land',
    protocol: 'https',
    wsProtocol: 'wss',
    port: 443,
    silentExt: 'production'
  },
  client: {
    domain: 'play.rair.land',
    protocol: 'https',
    port: 443
  },
  auth0: {
    domain: 'landoftherair.auth0.com',
    client: 'U8bTIfByag72iLPYAf7LxXVrBDC0M-Ov',
    callbackUrl: 'https://play.rair.land',
    apiUrl: 'authidentifier'
  },
  deepstream: {
    url: 'wss://deepstream.rair.land:6020/deepstream'
  }
};
