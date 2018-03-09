
import { species } from 'fantastical';
import { capitalize, isString, sample, kebabCase, includes } from 'lodash';

import { ItemCreator } from '../world/item-creator';
import { NPC } from '../../../shared/models/npc';
import { DB } from '../../database';
import { Player } from '../../../shared/models/player';

import * as Effects from '../../effects';
import { Item } from '../../../shared/models/item';

export class NPCLoader {

  static itemCreator = new ItemCreator();

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

  static determineNPCName(npc: NPC) {
    let func = 'human';

    switch(npc.allegiance) {
      case 'None': func = 'human'; break;
      case 'Pirates': func = 'dwarf'; break;
      case 'Townsfolk': func = 'human'; break;
      case 'Royalty': func = sample(['elf', 'highelf']); break;
      case 'Adventurers': func = 'human'; break;
      case 'Wilderness': func = sample(['fairy', 'highfairy']); break;
      case 'Underground': func = sample(['goblin', 'orc', 'ogre']); break;
    }

    if(func === 'human') return species[func]({ allowMultipleNames: false });
    return species[func](sample(['male', 'female']));
  }

  static loadItem(item) {
    return this.itemCreator.getItemByName(item);
  }

  private static async _loadVendorItems(npc: NPC, items: Array<{ name: string, valueMult: number }>) {
    npc.vendorItems = npc.vendorItems || [];

    const loadedItems = await Promise.all(items.map(async ({ name, valueMult }) => {
      const item = await this.loadItem(name);

      item.value = Math.floor((valueMult || 1) * item.value);

      return item;
    }));

    npc.vendorItems.push(...loadedItems);

    return loadedItems;
  }

  static async loadVendorItems(npc: NPC, items: any[]) {
    items = items.map(item => {
      if(isString(item)) return { name: item, valueMult: 1 };
      return item;
    });

    return this._loadVendorItems(npc, items);
  }

  static async loadDailyVendorItems(npc: NPC, items: any[]) {
    items = items.map(item => {
      if(isString(item)) return { name: item, valueMult: 1 };
      return item;
    });

    const dailyItems = await this._loadVendorItems(npc, items);

    dailyItems.forEach((item, i) => {
      item.uuid = kebabCase(`${npc.name}-${item.name}-${i}`);
      item.daily = true;
    });

    return dailyItems;
  }

  static checkPlayerHeldItemEitherHand(player: Player, itemName: string) {
    return player.hasHeldItem(itemName, 'right') || player.hasHeldItem(itemName, 'left');
  }

  static checkPlayerHeldItemBothHands(player: Player, itemName: string) {
    return player.hasHeldItem(itemName, 'right') && player.hasHeldItem(itemName, 'left');
  }

  static takePlayerItemFromEitherHand(player: Player, itemName: string) {
    if(this.takePlayerItem(player, itemName, 'right')) return;
    this.takePlayerItem(player, itemName, 'left');
  }

  static checkPlayerHeldItem(player: Player, itemName: string, hand: 'left'|'right' = 'right') {
    return player.hasHeldItem(itemName, hand);
  }

  static takePlayerItem(player: Player, itemName: string, hand: 'left'|'right' = 'right'): boolean {
    if(!player[`${hand}Hand`] || player[`${hand}Hand`].name !== itemName) return false;
    player[`set${capitalize(hand)}Hand`](null);
    return true;
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

  static getItemsFromPlayerSackByName(player: Player, name, partial = false) {
    const indexes = [];

    for(let i = 0; i < player.sack.allItems.length; i++) {
      const item = player.sack.allItems[i];

      if(!item) continue;

      if(partial) {
        if(!includes(item.name, name)) continue;
      } else {
        if(item.name !== name) continue;
      }

      indexes.push(i);
    }

    return indexes;
  }

  static takeItemsFromPlayerSack(player: Player, sackIndexes = []): Item[] {
    return player.sack.takeItemFromSlots(sackIndexes);
  }
}
