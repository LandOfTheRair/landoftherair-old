
import { NPC } from '../../shared/models/npc';
import { Item } from '../../shared/models/item';

import { compact, get } from 'lodash';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';

export class LootHelper {

  static async getAllLoot(npc: NPC, bonus = 0, sackOnly = false): Promise<Item[]> {
    const tables = [];

    if(npc.$$room.dropTables.map.length > 0) {
      tables.push({
        table: new LootTable(npc.$$room.dropTables.map, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(npc.$$room.dropTables.region.length > 0) {
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
      const { items, choose } = npc.dropPool;
      if(choose > 0 && items.length > 0) {
        tables.push({
          table: new LootTable(items, bonus),
          func: LootFunctions.WithoutReplacement,
          args: choose
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

  public static async getItemsFromTables(tables: any[], room) {

    const items = LootRoller.rollTables(tables);

    const itemPromises: Array<Promise<Item>> = items.map(itemName => room.itemCreator.getItemByName(itemName, room));
    const allItems: Item[] = await Promise.all(itemPromises);

    return allItems;
  }
}
