import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import * as Colyseus from 'colyseus.js';
import { ColyseusLobbyService } from './colyseus.lobby.service';
import { ColyseusGameService } from './colyseus.game.service';

@Injectable()
export class ColyseusService {

  client: any;

  constructor(public lobby: ColyseusLobbyService, public game: ColyseusGameService) {}

  init() {
    this.initClient();
    this.lobby.init(this, this.client);
  }

  initGame(character) {
    this.game.init(this, this.client, character);
  }

  private initClient() {
    this.client = new Colyseus.Client(`ws://${environment.server.domain}:${environment.server.port}`);
  }
}
