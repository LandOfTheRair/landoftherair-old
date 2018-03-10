

require('dotenv').config({ silent: true });

import { DB } from './database';
import { GameAPI } from './api';
import { Logger } from './logger';

import { includes } from 'lodash';

import * as colyseus from 'colyseus';

import * as Rooms from './rooms';

import * as recurse from 'recursive-readdir';
import * as path from 'path';
import * as cluster from 'cluster';
import * as http from 'http';

if(!process.env.AUTH0_SECRET) {
  Logger.log('No env.AUTH0_SECRET. Set one.');
  process.exit(0);
}

process.on('unhandledRejection', e => {
  Logger.error(e);
});

process.on('uncaughtException', e => {
  Logger.error(e);
});

DB.init();

const port = process.env.PORT || 3303;

if(process.argv[2] === '--single-core') {

  const api = new GameAPI();

  const server = http.createServer(api.expressApp);

  const gameServer = new colyseus.Server({ server });

  Logger.log(`[Single] Started server on port ${port}`);


  gameServer.register('Lobby', Rooms.Lobby);

  const allMapNames = {};

  recurse(`${__dirname}/../content/maps`).then(files => {
    files.forEach(file => {
      const mapName = path.basename(file, path.extname(file));
      allMapNames[mapName] = true;
      const proto = includes(mapName, '-Dungeon') ? Rooms.InstancedDungeon : Rooms.GameWorld;
      gameServer.register(mapName, proto, { mapName, mapPath: file, allMapNames });
    });
  });

  server.listen(port);

} else {

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

    recurse(`${__dirname}/../content/maps`).then(files => {
      files.forEach(file => {
        const mapName = path.basename(file, path.extname(file));
        allMapNames[mapName] = true;
        const proto = includes(mapName, '-Dungeon') ? Rooms.InstancedDungeon : Rooms.GameWorld;
        gameServer.register(mapName, proto, { mapName, mapPath: file, allMapNames });
        Logger.log(`[Child] Registered map ${mapName}`);
      });
    });

    gameServer.attach({ server: api.expressApp });
  }
}
