
import { BUILDVARS } from './_vars';

const buildVersion = BUILDVARS.version.tag || BUILDVARS.version.semverString || BUILDVARS.version.raw || BUILDVARS.version.hash;
const buildDate = new Date();

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
  stripe: {
    key: 'pk_live_dHe4YokXv14cVzmj38NYbqVU'
  },
  rollbar: {
    token: '4d7c7a0d19114e19b98c0112afa27f7f'
  },
  assetHashes: BUILDVARS.hashes,
  version: `${buildVersion} (built on ${buildDate})`
};
