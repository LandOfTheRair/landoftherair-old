

require('dotenv').config({ silent: true });

import { DB } from './database';
import { GameAPI } from './api';
import { Logger } from './logger';

import { includes } from 'lodash';

import { Server, MemsharedPresence } from 'colyseus';
import { monitor } from '@colyseus/monitor';

import * as Rooms from './rooms';

import * as recurse from 'recursive-readdir';
import * as path from 'path';
import * as http from 'http';
import * as cluster from 'cluster';

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

DB.init()
  .then(() => {

    const port = process.env.PORT || 3303;

    const mapPath = process.env.NODE_ENV === 'production' ? '' : '../content';

    if(process.argv[2] === '--single-core') {

      const api = new GameAPI();

      const server = http.createServer(api.expressApp);

      const gameServer = new Server({
        server
      });

      Logger.log(`[Single] Started server on port ${port}`);

      gameServer.register('Lobby', Rooms.Lobby);

      const allMapNames = {};

      recurse(`${__dirname}/${mapPath}/maps`).then(files => {
        files.forEach(file => {
          const mapName = path.basename(file, path.extname(file));
          allMapNames[mapName] = true;
          const proto = includes(mapName, '-Dungeon') ? Rooms.InstancedDungeon : Rooms.GameWorld;
          gameServer.register(mapName, proto, { mapName, mapPath: file, allMapNames });
        });

        api.expressApp.use('/colyseus', monitor(gameServer));

        server.listen(port);
      });

    } else {

      if(cluster.isMaster) {

        Logger.log(`[Parent] Started server on port ${port}`);

        for (let i = 0; i < require('os').cpus().length; i++) {
          cluster.fork();
        }

      } else {

        Logger.log(`[Child] Started server on port ${port}`);

        const api = new GameAPI();
        const server = http.createServer(api.expressApp);

        const gameServer = new Server({
          presence: new MemsharedPresence(),
          server
        });

        gameServer.register('Lobby', Rooms.Lobby);

        const allMapNames = {};

        recurse(`${__dirname}/${mapPath}/maps`).then(files => {
          files.forEach(file => {
            const mapName = path.basename(file, path.extname(file));
            allMapNames[mapName] = true;
            const proto = includes(mapName, '-Dungeon') ? Rooms.InstancedDungeon : Rooms.GameWorld;
            gameServer.register(mapName, proto, { mapName, mapPath: file, allMapNames });
          });

          if(process.env.NODE_ENV !== 'production') {
            api.expressApp.use('/colyseus', monitor(gameServer));
          }
          server.listen(port);
        });
      }
    }
  });
