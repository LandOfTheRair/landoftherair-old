import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import * as Colyseus from 'colyseus.js';
import { ColyseusLobbyService } from './colyseus.lobby.service';

@Injectable()
export class ColyseusService {

  client: any;

  constructor(public lobby: ColyseusLobbyService) {}

  init() {
    this.initClient();
    this.lobby.init(this.client);
  }

  private initClient() {
    this.client = new Colyseus.Client(`ws://${environment.domain}:${environment.port}`);
  }
}
