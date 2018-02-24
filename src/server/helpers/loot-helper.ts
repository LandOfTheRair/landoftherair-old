
import { NPC } from '../../shared/models/npc';
import { Item } from '../../shared/models/item';

import { compact, get, isNumber, random } from 'lodash';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';

export class LootHelper {

  static isItemValueStackable(item: Item): boolean {
    return item.itemClass === 'Coin';
  }

  static async getAllLoot(npc: NPC, bonus = 0, sackOnly = false): Promise<Item[]> {
    const tables = [];

    const isNaturalResource = npc.isNaturalResource;

    if(!isNaturalResource && npc.$$room.dropTables.map.length > 0) {
      tables.push({
        table: new LootTable(npc.$$room.dropTables.map, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(!isNaturalResource && npc.$$room.dropTables.region.length > 0) {
      tables.push({
        table: new LootTable(npc.$$room.dropTables.region, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(npc.drops && npc.drops.length > 0) {
      tables.push({
        table: new LootTable(npc.drops, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(npc.dropPool) {
      const { items, choose, replace } = npc.dropPool;

      const numChoices = random(choose.min, choose.max);

      if(numChoices > 0 && items.length > 0) {
        tables.push({
          table: new LootTable(items, bonus),
          func: replace ? LootFunctions.WithReplacement : LootFunctions.WithoutReplacement,
          args: numChoices
        });
      }
    }

    if(!sackOnly && npc.copyDrops && npc.copyDrops.length > 0) {
      const drops = compact(npc.copyDrops.map(({ drop, chance }) => {
        if(drop === 'rightHand' || drop === 'leftHand') return;
        const item = get(npc, drop);
        if(!item) return null;
        return { result: item.name, chance };
      }));

      if(drops.length > 0) {
        tables.push({
          table: new LootTable(drops, bonus),
          func: LootFunctions.EachItem,
          args: 0
        });
      }
    }

    const rolledItems = await this.getItemsFromTables(tables, npc.$$room);

    if(npc.rightHand) rolledItems.push(npc.rightHand);
    if(npc.leftHand) rolledItems.push(npc.leftHand);
    return rolledItems;
  }

  public static async rollSingleTable(rollArray: Array<{ chance: number, result: string }>, room) {
    return this.getItemsFromTables([{
      table: new LootTable(rollArray, 0),
      func: LootFunctions.WithoutReplacement,
      args: 1
    }], room);
  }

  public static async getItemsFromTables(tables: any[], room) {

    const items = LootRoller.rollTables(tables);

    const itemPromises: Array<Promise<Item>> = items.map(itemName => room.itemCreator.getItemByName(itemName, room));
    const allItems: Item[] = await Promise.all(itemPromises);

    return allItems;
  }
}
