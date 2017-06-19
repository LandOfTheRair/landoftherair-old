export const environment = {
  production: true,
  server: {
    domain: 'localhost',
    protocol: 'http',
    port: 3303,
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
  }
};
