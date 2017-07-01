export const environment = {
  production: true,
  server: {
    domain: 'server.rair.land',
    protocol: 'https',
    port: 80,
  },
  client: {
    domain: 'rair.land',
    protocol: 'https',
    port: 80,
    silentExt: 'production'
  },
  auth0: {
    domain: 'landoftherair.auth0.com',
    client: 'U8bTIfByag72iLPYAf7LxXVrBDC0M-Ov',
    callbackUrl: 'https://rair.land',
    apiUrl: 'https://landoftherair.auth0.com/auth/'
  }
};
