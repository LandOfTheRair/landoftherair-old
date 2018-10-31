

require('dotenv').config({ silent: true });

import { DB } from './database';
import { GameAPI } from './api';
import { Logger } from './logger';

import * as uuid from 'uuid/v4';
import { includes } from 'lodash';

import { Server, MemsharedPresence, RedisPresence } from 'colyseus';

import * as Rooms from './rooms';

import * as recurse from 'recursive-readdir';
import * as path from 'path';
import * as http from 'http';
import * as cluster from 'cluster';

if(!process.env.AUTH0_SECRET) {
  Logger.log('No env.AUTH0_SECRET. Set one.');
  process.exit(0);
}

const USE_REDIS_INSTEAD = process.env.USE_REDIS_INSTEAD;

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

        server.listen(port);
      });

    } else {

      if(cluster.isMaster) {

        Logger.log(`[Parent] Started server on port ${port}`);

        const gameUUID = uuid();

        for (let i = 0; i < require('os').cpus().length; i++) {
          cluster.fork({ GAME_INSTANCE: gameUUID });
        }

      } else {

        Logger.log(`[Child] Started server on port ${port}`);

        const api = new GameAPI();
        const server = http.createServer(api.expressApp);

        const presence = USE_REDIS_INSTEAD ? new RedisPresence({ url: process.env.REDIS_URL }) : new MemsharedPresence();

        const gameServer = new Server({
          presence,
          server,
          pingTimeout: 0
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

          server.listen(port);
        });
      }
    }
  });
