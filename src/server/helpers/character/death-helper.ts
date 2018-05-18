

import { Player } from '../../../shared/models/player';
import { Item } from '../../../shared/models/item';
import { Character } from '../../../shared/models/character';
import { NPC } from '../../../shared/models/npc';

import { LootHelper } from '../world/loot-helper';

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
    if(target.$$corpseRef) return;
    if(target.$$owner) return;
    target.$$corpseRef = new Item({});

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
      corpse.$$playersHeardDeath = target.$$room.state.getPlayersInRange(target, 7, [], false).map(x => (<Player>x).username);
    }

    return corpse;
  }

  static async calculateLootDrops(npc: NPC, killer: Character) {
    const bonus = killer.getTotalStat('luk');

    // natural resources always drop, no matter who killed them ~immersion~
    if(npc.allegiance !== 'NaturalResource' && !killer.isPlayer()) {
      if(npc.dropsCorpse) this.createCorpse(npc, []);
      return;
    }

    const allItems = await LootHelper.getAllLoot(npc, bonus);

    if(npc.gold) {
      const adjustedGold = npc.$$room.calcAdjustedGoldGain(npc.gold);
      const gold = await npc.$$room.itemCreator.getGold(adjustedGold);
      allItems.push(gold);
    }

    if(npc.dropsCorpse) {
      this.createCorpse(npc, allItems);

    } else if(allItems.length > 0) {

      if(npc.isNaturalResource) {
        if(npc.isOreVein) {
          killer.sendClientMessage(`Something falls out of the rubble.`);
        } else {
          killer.sendClientMessage(`Something falls to the ground.`);
        }
      }

      allItems.forEach(item => npc.$$room.addItemToGround(npc, item));
    }
  }
}
