
import { capitalize } from 'lodash';

import { ItemCreator } from './item-creator';
import { NPC } from '../../models/npc';
import { DB } from '../database';
import { Player } from '../../models/player';

import * as Effects from '../effects';

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

  static checkPlayerHeldItem(player: Player, itemName: string) {
    return player.hasHeldItem(itemName);
  }

  static takePlayerItem(player: Player, itemName: string, hand: 'left'|'right' = 'right') {
    player[`set${capitalize(hand)}Hand`](null);
  }

  static async givePlayerItem(player: Player, itemName: string, hand: 'left'|'right' = 'right', setOwner = true) {
    const item = await this.loadItem(itemName);
    if(setOwner) {
      item.setOwner(player);
    }
    player[`set${capitalize(hand)}Hand`](item);
  }

  static givePlayerEffect(player: Player, effectName: string, { potency, duration }: any = {}) {
    player.applyEffect(new Effects[effectName]({ name: effectName, potency, duration }));
  }
}
