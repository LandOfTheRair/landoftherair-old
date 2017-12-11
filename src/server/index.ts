
require('dotenv').config({ silent: true });

import { DB } from './database';
import { GameAPI } from './api';
import { Logger } from './logger';

import * as colyseus from 'colyseus';

import * as Rooms from './rooms';

import * as recurse from 'recursive-readdir';
import * as path from 'path';
import * as cluster from 'cluster';

if(!process.env.AUTH0_SECRET) {
  console.log('No env.AUTH0_SECRET. Set one.');
  process.exit(0);
}

process.on('unhandledRejection', e => {
  Logger.error(e);
});

process.on('uncaughtException', e => {
  Logger.error(e);
});

const port = process.env.PORT || 3303;

const gameServer = new colyseus.ClusterServer({});

if(cluster.isMaster) {
  gameServer.listen(port);
  Logger.log(`[Master] Started server on port ${port}`);

  gameServer.fork();

} else {
  Logger.log(`[Child] Started child process ${process.pid}`);

  const api = new GameAPI();

  gameServer.register('Lobby', Rooms.Lobby);

  const allMapNames = {};

  recurse(`${__dirname}/maps`).then(files => {
    files.forEach(file => {
      const mapName = path.basename(file, path.extname(file));
      allMapNames[mapName] = true;
      gameServer.register(mapName, Rooms.GameWorld, { mapName, mapPath: file, allMapNames });
    });
  });

  DB.isReady.then(() => {
    gameServer.attach({ server: api.expressApp });
  });
}
