
import * as colyseus from 'colyseus';
import * as http from 'http';
import * as express from 'express';

import * as Rooms from './rooms';

import { Logger } from './logger';

class GameAPI {

  public isReady: Promise<any>;

  constructor() {
    this.isReady = new Promise(resolve => {
      const app = express();
      const port = process.env.PORT || 3303;

      const server = http.createServer(app);
      const gameServer = new colyseus.Server({ server });

      Object.keys(Rooms).forEach(name => {
        gameServer.register(name, Rooms[name]);
      });

      server.listen(port);
      Logger.log(`Started server on port ${port}`);
      resolve();
    });
  }
}

export const API = new GameAPI();
