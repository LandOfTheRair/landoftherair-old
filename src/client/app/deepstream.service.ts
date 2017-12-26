import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import { Character } from '../../shared/models/character';

import { debounce, difference, extend, endsWith } from 'lodash';

import * as swal from 'sweetalert2';
import * as Deepstream from 'deepstream.io-client-js';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DeepstreamService {

  private _isConnected: boolean;
  public get isConnected(): boolean {
    return this._isConnected;
  }

  private ds: any;
  private mapName: string;
  private mapId: string|number;

  private ground: any;
  private npcHash: any;
  private currentNPCHash: any = {};
  private npcData: any;
  private npcVolatile: any;

  private npcDataSubs: any = {};
  private npcVolatileSubs: any = {};

  public allNPCsHash: any = {};
  public ground$ = new BehaviorSubject<any>({});

  constructor() {
    this.ds = Deepstream(environment.deepstream.url);
    this.ds.login({}, (success) => {
      this._isConnected = success;

      if(!success) {
        this.errorMessage();
      }
    });

    this.ds.on('error', e => {
      console.error(e);
    });
  }

  private updateNPCList(data: any) {
    const currentNPCList = Object.keys(this.currentNPCHash);
    const newNPCList = Object.keys(data);

    const newNPCs = difference(newNPCList, currentNPCList);
    const delNPCs = difference(currentNPCList, newNPCList);

    newNPCs.forEach(npcId => this.addNPC(npcId));
    delNPCs.forEach(npcId => this.delNPC(npcId));

    this.currentNPCHash = data;
  }

  init(mapName: string, mapId?: string|number) {
    this.mapName = mapName;
    this.mapId = mapId;

    const subPath = this.mapId && endsWith(this.mapName, 'Dungeon') ? `${this.mapName}-${this.mapId}` : this.mapName;

    // prevent loading deepstream records that dont have a party id, but should
    if(subPath === this.mapName && endsWith(this.mapName, '-Dungeon')) return;

    this.ground = this.ds.record.getRecord(`${subPath}/groundItems`);
    this.ground.subscribe(data => this.ground$.next(data), true);

    this.npcData = this.ds.record.getRecord(`${subPath}/npcData`);
    this.npcVolatile = this.ds.record.getRecord(`${subPath}/npcVolatile`);

    this.npcHash = this.ds.record.getRecord(`${subPath}/npcHash`);
    this.npcHash.subscribe(debounce(this.updateNPCList.bind(this), 500), true);
  }

  uninit() {
    this.mapName = '';
    this.mapId = '';
    if(this.ground) this.ground.discard();
    if(this.npcData) this.npcData.discard();
    if(this.npcHash) this.npcHash.discard();
    if(this.npcVolatile) this.npcVolatile.discard();

    Object.keys(this.currentNPCHash || {}).forEach(npcId => {
      this.delNPC(npcId);
    });

    this.currentNPCHash = {};
  }

  private errorMessage() {
    (<any>swal)({
      titleText: 'Could Not Connect To Sync Server',
      text: 'For some reason, the game could not connect to the sync server.',
      type: 'error'
    });
  }

  private addNPC(npcId: string) {

    this.npcDataSubs[npcId] = this.npcData.subscribe(npcId, (data) => {
      if(!data) return;

      this.allNPCsHash[npcId] = new Character(data);
    }, true);

    this.npcVolatileSubs[npcId] = this.npcVolatile.subscribe(npcId, (data) => {
      if(!data) return;

      const npc = this.allNPCsHash[npcId];
      if(!npc) return;

      const { hp, x, y, dir, agro, effects } = data;

      if(!hp) {
        this.delNPC(npcId);
        return;
      }

      npc.x = x;
      npc.y = y;
      npc.dir = dir;
      npc.agro = agro;
      npc.effects = effects || [];
      npc.hp.__current = hp.__current;
    }, true);
  }

  private delNPC(npcId: string) {
    delete this.allNPCsHash[npcId];

    try {
      this.npcData.unsubscribe(npcId);
    } catch(e) {}

    try {
      this.npcVolatile.unsubscribe(npcId);
    } catch(e) {}
  }

}
