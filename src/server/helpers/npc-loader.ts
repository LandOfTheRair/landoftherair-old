
import { ItemCreator } from './item-creator';
import { NPC } from '../../models/npc';
import { DB } from '../database';

export class NPCLoader {

  static loadNPCData(npcId) {
    return DB.$npcs.findOne({ npcId }).then(npc => {
      if(!npc) throw new Error(`NPC ${npcId} does not exist.`);
      return npc;
    });
  }

  static loadItem(item) {
    return ItemCreator.getItemByName(item);
  }

  static async loadVendorItems(npc: NPC, items: string[]) {
    npc.vendorItems = await Promise.all(items.map(item => this.loadItem(item)));
  }
}
