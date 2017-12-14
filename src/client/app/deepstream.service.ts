import { Injectable, NgZone } from '@angular/core';
import { environment } from '../environments/environment';

import { Character } from '../../shared/models/character';

import { debounce, difference, extend } from 'lodash';

import * as Deepstream from 'deepstream.io-client-js';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DeepstreamService {

  private ds: any;
  private mapName: string;

  private ground: any;
  private npcHash: any;
  private currentNPCHash: any = {};
  private npcData: any;
  private npcVolatile: any;

  private npcDataSubs: any = {};
  private npcVolatileSubs: any = {};

  public allNPCsHash: any = {};
  public ground$ = new BehaviorSubject<any>({});

  constructor(private zone: NgZone) {
    this.ds = Deepstream(environment.deepstream.url);
    this.ds.login();

    this.ds.on('error', e => {});
  }

  private updateNPCList(data: any) {
    const currentNPCList = Object.keys(this.currentNPCHash);
    const newNPCList = Object.keys(data);

    const newNPCs = difference(newNPCList, currentNPCList);
    const delNPCs = difference(currentNPCList, newNPCList);

    this.zone.runOutsideAngular(() => {
      newNPCs.forEach(npcId => this.addNPC(npcId));
      delNPCs.forEach(npcId => this.delNPC(npcId));
    });

    this.currentNPCHash = data;
  }

  init(mapName: string) {
    this.mapName = mapName;

    this.ground = this.ds.record.getRecord(`${mapName}/groundItems`);
    this.ground.subscribe(data => this.ground$.next(data), true);

    this.npcData = this.ds.record.getRecord(`${mapName}/npcData`);
    this.npcVolatile = this.ds.record.getRecord(`${mapName}/npcVolatile`);

    this.npcHash = this.ds.record.getRecord(`${mapName}/npcHash`);
    this.npcHash.subscribe(debounce(this.updateNPCList.bind(this), 500), true);
  }

  uninit() {
    this.mapName = '';
    if(this.ground) this.ground.discard();
    if(this.npcData) this.npcData.discard();
    if(this.npcVolatile) this.npcVolatile.discard();

    Object.keys(this.currentNPCHash || {}).forEach(npcId => {
      this.delNPC(npcId);
    });

    this.currentNPCHash = {};
  }

  private addNPC(npcId: string) {

    this.npcDataSubs[npcId] = this.npcData.subscribe(npcId, (data) => {
      if(!data) return;
      this.allNPCsHash[npcId] = new Character(data);
    }, true);

    this.npcVolatileSubs[npcId] = this.npcVolatile.subscribe(npcId, (data) => {
      if(!data) return;

      const { hp, x, y, dir, agro, effects } = data;

      const npc = this.allNPCsHash[npcId];
      if(!npc) return;

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
