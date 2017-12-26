

import { Player } from '../../shared/models/player';
import { Item } from '../../shared/models/item';
import { Character } from '../../shared/models/character';
import { NPC } from '../../shared/models/npc';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';

import { compact, get } from 'lodash';

export class DeathHelper {

  static autoReviveAndUncorpse(player: Player) {
    if(!player.isDead()) return;
    player.restore(false);
  }

  static corpseCheck(player, specificCorpse?: Item) {

    let item = null;

    if(player.leftHand
      && player.leftHand.itemClass === 'Corpse'
      && (!specificCorpse || (specificCorpse && player.leftHand === specificCorpse) )) {
      item = player.leftHand;
      player.setLeftHand(null);
    }

    if(player.rightHand
      && player.rightHand.itemClass === 'Corpse'
      && (!specificCorpse || (specificCorpse && player.rightHand === specificCorpse) )) {
      item = player.rightHand;
      player.setRightHand(null);
    }

    if(item) {
      item.$heldBy = null;
      player.$$room.addItemToGround(player, item);
    }
  }

  static async createCorpse(target: Character, searchItems = [], customSprite = 0): Promise<Item> {
    const corpse = await target.$$room.itemCreator.getItemByName('Corpse');
    corpse.sprite = customSprite || target.sprite + 4;
    corpse.searchItems = searchItems;
    corpse.desc = `the corpse of a ${target.name}`;
    corpse.name = `${target.name} corpse`;

    target.$$room.addItemToGround(target, corpse);

    const isPlayer = target.isPlayer();
    corpse.$$isPlayerCorpse = isPlayer;

    target.$$corpseRef = corpse;

    if(!isPlayer) {
      corpse.tansFor = (<any>target).tansFor;
      (<any>corpse).npcUUID = target.uuid;
      corpse.$$playersHeardDeath = target.$$room.state.getPlayersInRange(target, 6).map(x => (<Player>x).username);
    }

    return corpse;
  }


  static async calculateLootDrops(npc: NPC, killer: Character) {
    const bonus = killer.getTotalStat('luk');

    if(!killer.isPlayer()) {
      this.createCorpse(npc, []);
      return;
    }

    const allItems = await this.getAllLoot(npc, bonus);

    if(npc.gold) {
      const adjustedGold = npc.$$room.calcAdjustedGoldGain(npc.gold);
      const gold = await npc.$$room.itemCreator.getGold(adjustedGold);
      allItems.push(gold);
    }

    this.createCorpse(npc, allItems);
  }

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

    const items = LootRoller.rollTables(tables);

    const itemPromises: Array<Promise<Item>> = items.map(itemName => npc.$$room.itemCreator.getItemByName(itemName, npc.$$room));
    const allItems: Item[] = await Promise.all(itemPromises);

    if(npc.rightHand) allItems.push(npc.rightHand);
    if(npc.leftHand) allItems.push(npc.leftHand);
    return allItems;
  }
}
