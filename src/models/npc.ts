
import { Character } from './character';
import { Item } from './item';
import * as uuid from 'uuid/v4';

export type Hostility = 'Never' | 'OnHit' | 'OppositeAlignment' | 'Faction' | 'Always';

export class NPC extends Character {
  uuid: string;

  sprite: number;
  hostility: Hostility = 'OnHit';
  agro: any = {};
  vendorItems: Item[];
  script: string;

  init() {
    if(!this.uuid) this.uuid = uuid();
  }
}
