import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import * as Colyseus from 'colyseus.js';
import { ColyseusLobbyService } from './colyseus.lobby.service';
import { ColyseusGameService } from './colyseus.game.service';

@Injectable()
export class ColyseusService {

  client: any;
  private _isConnected = false;

  constructor(public lobby: ColyseusLobbyService, public game: ColyseusGameService) {}

  init() {
    this.initClient();
    this.lobby.init(this, this.client);

    if(!environment.production) {
      (<any>window).colyseus = this;
    }
  }

  initGame(character) {
    this.game.init(this, this.client, character);
  }

  private initClient() {
    this.client = new Colyseus.Client(`${environment.server.wsProtocol}://${environment.server.domain}:${environment.server.port}`);

    this.client.onOpen.add(() => {
      this._isConnected = true;
    });

    this.client.onClose.add(() => {
      this.game.quit();
      this._isConnected = false;
    });
  }

  get isConnected() {
    return this._isConnected;
  }

  get username() {
    return this.lobby.myAccount.username;
  }
}
