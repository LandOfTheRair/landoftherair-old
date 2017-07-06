
require('dotenv').config({ silent: true });

import { DB } from './database';
import { API } from './api';
import { Logger } from './logger';

if(!process.env.AUTH0_SECRET) {
  console.log('No env.AUTH0_SECRET. Set one.');
  process.exit(0);
}

Promise.all([DB.isReady, API.isReady]).then(() => {
  console.log('Server ready!');
});

process.on('unhandledRejection', e => {
  Logger.error(e);
});

process.on('uncaughtException', e => {
  Logger.error(e);
});
