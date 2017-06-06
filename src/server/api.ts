
import * as colyseus from 'colyseus';
import * as http from 'http';
import * as express from 'express';
import * as cors from 'cors';

import * as Rooms from './rooms';

import * as recurse from 'recursive-readdir';
import * as path from 'path';

import { Logger } from './logger';

class GameAPI {

  public isReady: Promise<any>;

  constructor() {
    this.isReady = new Promise(resolve => {
      const app = express();
      app.use(cors());
      app.use('/maps', express.static(require('path').join(__dirname, 'maps')));
      const port = process.env.PORT || 3303;

      const server = http.createServer(app);
      const gameServer = new colyseus.Server({ server });

      gameServer.register('Lobby', Rooms.Lobby);

      const allMapNames = {};

      recurse(`${__dirname}/maps`).then(files => {
        files.forEach(file => {
          const mapName = path.basename(file, path.extname(file));
          allMapNames[mapName] = true;
          gameServer.register(mapName, Rooms.GameWorld, { mapName, mapPath: file, allMapNames });
        })
      });

      server.listen(port);
      Logger.log(`Started server on port ${port}`);
      resolve();
    });
  }
}

export const API = new GameAPI();
