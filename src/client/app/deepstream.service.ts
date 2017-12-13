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
  private npcData: any = {};
  private npcVolatile: any = {};

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

    this.npcHash = this.ds.record.getRecord(`${mapName}/npcHash`);
    this.npcHash.subscribe(debounce(this.updateNPCList.bind(this), 500), true);
  }

  uninit() {
    this.mapName = '';
    if(this.ground) this.ground.discard();
    if(this.npcHash) this.npcHash.discard();

    Object.keys(this.currentNPCHash || {}).forEach(npcId => {
      this.delNPC(npcId);
    });
  }

  private addNPC(npcId: string) {
    this.npcData[npcId] = this.ds.record.getRecord(`${this.mapName}/npcData/${npcId}`);
    this.npcData[npcId].subscribe(data => {
      this.allNPCsHash[npcId] = new Character(data);
    }, true);

    // this data has to be populated before we edit it
    this.npcVolatile[npcId] = this.ds.record.getRecord(`${this.mapName}/npcVolatile/${npcId}`);
    this.npcVolatile[npcId].subscribe(({ hp, x, y, dir, agro, effects }) => {

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
      this.npcData[npcId].discard();
    } catch(e) {}

    try {
      this.npcVolatile[npcId].discard();
    } catch(e) {}
  }

}
