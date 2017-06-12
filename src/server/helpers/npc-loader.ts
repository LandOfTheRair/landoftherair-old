
import { ItemCreator } from './item-creator';
import { NPC } from '../../models/npc';

export class NPCLoader {

  static loadItem(item) {
    return ItemCreator.getItemByName(item);
  }

  static async loadVendorItems(npc: NPC, items: string[]) {
    npc.vendorItems = await Promise.all(items.map(item => this.loadItem(item)));
  }
}
