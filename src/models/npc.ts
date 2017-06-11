
import { Character } from './character';
import { Item } from './item';
import { ItemCreator } from '../server/helpers/item-creator';

export type Hostility = 'Never' | 'OnHit' | 'OppositeAlignment' | 'Faction' | 'Always';

export class NPC extends Character {
  sprite: number;
  hostility: Hostility = 'OnHit';
  agro: any = {};
  vendorItems: Item[];

  async loadVendorItems(items: string[]) {
    this.vendorItems = await Promise.all(items.map(item => ItemCreator.getItemByName(item)));
  }
}
