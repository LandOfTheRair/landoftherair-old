import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import * as Colyseus from 'colyseus.js';
import { isUndefined } from 'lodash';
import { ColyseusLobbyService } from './colyseus.lobby.service';
import { ColyseusGameService } from './colyseus.game.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ColyseusService {

  client: any;
  private _isConnected = false;
  public isConnected$ = new Subject();

  public windowLocations: any = {
    lobby: null,
    characterSelect: null,
    map: null,
    stats: null,
    skills: null,
    tradeSkills: null,
    commandLine: null,
    log: null,
    status: null,
    ground: null,
    sack: null,
    belt: null,
    pouch: null,
    equipment: null,
    equipmentViewOnly: null,
    npcs: null,
    macros: null,
    trainer: null,
    shop: null,
    bank: null,
    locker: null,
    party: null,
    traits: null,
    tradeskillAlchemy: null,
    tradeskillSpellforging: null
  };

  public defaultWindowLocations = {
    lobby:                      { x: 299,  y: 55 },
    characterSelect:            { x: 0,    y: 55 },
    map:                        { x: 389,  y: 56 },
    stats:                      { x: 389,  y: 96 },
    skills:                     { x: 389,  y: 96 },
    tradeSkills:                { x: 389,  y: 96 },
    commandLine:                { x: 389,  y: 844 },
    log:                        { x: 3,    y: 365 },
    status:                     { x: 389,  y: 743 },
    ground:                     { x: 3,    y: 625 },
    sack:                       { x: 966,  y: 538 },
    belt:                       { x: 966,  y: 433 },
    pouch:                      { x: 866,  y: 538 },
    equipment:                  { x: 966,  y: 56 },
    equipmentViewOnly:          { x: 866,  y: 56 },
    npcs:                       { x: 3,    y: 56 },
    macros:                     { x: 389,  y: 661 },
    trainer:                    { x: 670,  y: 120 },
    shop:                       { x: 670,  y: 120 },
    bank:                       { x: 670,  y: 120 },
    locker:                     { x: 670,  y: 120 },
    party:                      { x: 670,  y: 120 },
    traits:                     { x: 670,  y: 120 },
    tradeskillAlchemy:          { x: 670,  y: 120 },
    tradeskillSpellforging:     { x: 670,  y: 120 }
  };

  constructor(
    public lobby: ColyseusLobbyService,
    public game: ColyseusGameService
  ) {}

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
      this.isConnected$.next(true);
    });

    this.client.onError.add((e) => {
      if(!e) return;
      console.error(e);
      location.reload();

    });

    this.client.onClose.add(() => {
      this.game.quit();
      this._isConnected = false;
      this.isConnected$.next(false);
    });
  }

  get isConnected() {
    return this._isConnected;
  }

  get isDiscordConnected() {
    return this.lobby.lobbyState.discordConnected;
  }

  get username() {
    return this.lobby.myAccount.username;
  }

  get isSubscribed(): boolean {
    const baseVal = this.lobby.lobbyState.subTier[this.lobby.myAccount.username];

    // not really correct, but it keeps the message at bay
    if(isUndefined(baseVal)) return true;
    return baseVal > 0;
  }
}
