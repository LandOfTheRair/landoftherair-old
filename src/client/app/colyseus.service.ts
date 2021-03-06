import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import * as Colyseus from 'colyseus.js';
import { isUndefined } from 'lodash';
import { ColyseusLobbyService } from './colyseus.lobby.service';
import { ColyseusGameService } from './colyseus.game.service';
import { Subject } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class ColyseusService {

  client: any;
  private _isConnected = false;
  private _isConnecting = false;
  public isConnected$ = new Subject();

  private colyseusDebug: boolean;

  public get isDebug(): boolean {
    return this.colyseusDebug;
  }

  constructor(
    private localStorage: LocalStorageService,
    public lobby: ColyseusLobbyService,
    public game: ColyseusGameService
  ) {
    this.colyseusDebug = this.localStorage.retrieve('colyseusDebug');

    this.localStorage.observe('colyseusDebug')
      .subscribe(colyseusDebug => {
        this.colyseusDebug = colyseusDebug;
      });
  }

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

  public clearColyseusData() {
    localStorage.removeItem('colyseusid');
    localStorage.removeItem('reconnection');
  }

  private initClient() {
    this.clearColyseusData();

    this.client = new Colyseus.Client(`${environment.server.wsProtocol}://${environment.server.domain}:${environment.server.port}`);
    this._isConnecting = true;

    this.client.onOpen.add(() => {
      this._isConnected = true;
      this._isConnecting = false;
      this.isConnected$.next(true);
    });

    this.client.onError.add((e) => {
      if(!e) return;
      this._isConnecting = false;
      console.error(e);
      location.reload();

    });

    this.client.onClose.add(() => {
      this.game.quit();
      this._isConnected = false;
      this._isConnecting = false;
      this.isConnected$.next(false);
    });
  }

  get isConnected() {
    return this._isConnected;
  }

  get isConnecting() {
    return this._isConnecting;
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

  public debugLobbyLogMessage(data, source: 'incoming'|'outgoing') {
    if(!this.isDebug) return;

    // tslint:disable-next-line
    console.log(`Colyseus:Lobby`, `[${source}]`, data);
  }

  public debugGameLogMessage(data, source: 'incoming'|'outgoing') {
    if(!this.isDebug) return;
    // tslint:disable-next-line
    console.log(`Colyseus:Game`, `[${source}]`, data);
  }
}
