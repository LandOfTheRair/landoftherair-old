
import { Character } from './character';
import { Item } from './item';

export type Hostility = 'Never' | 'OnHit' | 'OppositeAlignment' | 'Faction' | 'Always';

export class NPC extends Character {
  sprite: number;
  hostility: Hostility = 'OnHit';
  agro: any = {};
  vendorItems: Item[];
  script: string;

  init() {
  }
}
