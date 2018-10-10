
import { NPC } from '../../../shared/models/npc';
import { Item } from '../../../shared/models/item';

import { compact, get, random, includes, cloneDeep } from 'lodash';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';
import { HolidayHelper } from '../../../shared/helpers/holiday-helper';

export class LootHelper {

  static isItemValueStackable(item: Item): boolean {
    return item.itemClass === 'Coin';
  }

  private static filterDropTable(dropTable: any[]) {
    return dropTable.filter(item => item.requireHoliday ? HolidayHelper.isHoliday(item.requireHoliday) : true);
  }

  static async getAllLoot(npc: NPC, bonus = 0, sackOnly = false): Promise<Item[]> {
    const tables = [];

    // elites double the players loot finding capability
    if(includes(npc.name, 'elite')) bonus *= 2;

    bonus = npc.$$room.calcAdjustedItemFindGain(bonus);

    const isNaturalResource = npc.isNaturalResource;

    if(!isNaturalResource && npc.$$room.dropTables.map.length > 0) {
      const filteredTable = LootHelper.filterDropTable(npc.$$room.dropTables.map);
      if(filteredTable.length > 0) {
        tables.push({
          table: new LootTable(filteredTable, bonus),
          func: LootFunctions.EachItem,
          args: 0
        });
      }
    }

    if(!isNaturalResource && npc.$$room.dropTables.region.length > 0) {
      const filteredTable = LootHelper.filterDropTable(npc.$$room.dropTables.region);
      if(filteredTable.length > 0) {
        tables.push({
          table: new LootTable(filteredTable, bonus),
          func: LootFunctions.EachItem,
          args: 0
        });
      }
    }

    if(npc.drops && npc.drops.length > 0) {
      const filteredTable = LootHelper.filterDropTable(npc.drops);
      if(filteredTable.length > 0) {
        tables.push({
          table: new LootTable(filteredTable, bonus),
          func: LootFunctions.EachItem,
          args: 0
        });
      }
    }

    if(npc.dropPool) {
      const { items, choose, replace } = npc.dropPool;

      const numChoices = random(choose.min, choose.max);

      if(numChoices > 0 && items.length > 0) {
        const filteredTable = LootHelper.filterDropTable(items);
        if(filteredTable.length > 0) {
          tables.push({
            table: new LootTable(filteredTable, bonus),
            func: replace ? LootFunctions.WithReplacement : LootFunctions.WithoutReplacement,
            args: numChoices
          });
        }
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
        const filteredTable = LootHelper.filterDropTable(drops);
        if(filteredTable.length > 0) {
          tables.push({
            table: new LootTable(filteredTable, bonus),
            func: LootFunctions.EachItem,
            args: 0
          });
        }
      }
    }

    const rolledItems = await this.getItemsFromTables(tables, npc.$$room);

    if(npc.rightHand) rolledItems.push(npc.rightHand);
    if(npc.leftHand) rolledItems.push(npc.leftHand);
    return rolledItems;
  }

  public static async rollSingleTable(rollArray: Array<{ chance: number, result: string }>, room) {
    return this.getItemsFromTables([{
      table: new LootTable(LootHelper.filterDropTable(rollArray), 0),
      func: LootFunctions.WithoutReplacement,
      args: 1
    }], room);
  }

  public static async rollSingleTableForEachItem(rollArray: Array<{ chance: number, result: string }>, room) {
    return this.getItemsFromTables([{
      table: new LootTable(LootHelper.filterDropTable(rollArray), 0),
      func: LootFunctions.EachItem,
      args: 1
    }], room);
  }

  public static async getItemsFromTables(tables: any[], room) {

    const items = LootRoller.rollTables(tables);

    const itemPromises: Array<Promise<Item>> = items.map(itemName => room.itemCreator.getItemByName(itemName, room));
    const allItems: Item[] = await Promise.all(itemPromises);

    return allItems;
  }

  public static async rollAnyTable(rollArray: Array<{ chance: number, result: any }>, num = 1) {
    const table = new LootTable(rollArray);
    return table.chooseWithoutReplacement(num);
  }
}
