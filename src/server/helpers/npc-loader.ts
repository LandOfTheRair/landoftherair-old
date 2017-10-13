
import { capitalize } from 'lodash';

import { ItemCreator } from './item-creator';
import { NPC } from '../../models/npc';
import { DB } from '../database';
import { Player } from '../../models/player';

import * as Effects from '../effects';

export class NPCLoader {

  static searchNPCs(name: string): Promise<NPC[]> {
    const regex = new RegExp(`.*${name}.*`, 'i');
    return DB.$npcs.find({ $or: [{ npcId: regex }, { name: regex }] }).toArray();
  }

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

  static checkPlayerHeldItem(player: Player, itemName: string, hand: 'left'|'right' = 'right') {
    return player.hasHeldItem(itemName, hand);
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

  static getItemsFromPlayerSackByName(player: Player, name) {
    const indexes = [];

    for(let i = 0; i < player.sack.allItems.length; i++) {
      const item = player.sack.allItems[i];
      if(!item || item.name !== name) continue;
      indexes.push(i);
    }

    return indexes;
  }

  static takeItemsFromPlayerSack(player: Player, sackIndexes = []) {
    player.sack.takeItemFromSlots(sackIndexes);
  }
}
