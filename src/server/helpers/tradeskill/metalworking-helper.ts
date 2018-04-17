
import { Player } from '../../../shared/models/player';
import { SkillClassNames } from '../../../shared/models/character';
import { capitalize, clamp, includes, get, cloneDeep } from 'lodash';
import { ArmorClasses, Item } from '../../../shared/models/item';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

const ingotCraftBuffs = {
  'Copper Ingot (Pillars)': {
    weapon: { str: 2 },
    armor:  { mitigation: 5 }
  },
  'Silver Ingot (Hourglass)': {
    weapon: { weaponArmorClass: 7 },
    armor:  { armorClass: 7 }
  },
  'Gold Ingot (Infinity)': {
    weapon: { agi: 2 },
    armor:  { hp: 75 }
  }
};

const ingotUpgradeBuffs = {
  'Copper Ingot (Pillars)': {
    weapon: { physicalDamageBoost: 25 },
    armor:  { mitigation: 1 }
  },
  'Silver Ingot (Hourglass)': {
    weapon: { weaponArmorClass: 2 },
    armor:  { armorClass: 2 }
  },
  'Gold Ingot (Infinity)': {
    weapon: { offense: 1, defense: 1, accuracy: 3 },
    armor:  { hp: 20 }
  }
};

export class MetalworkingHelper {

  /** PERK:CLASS:Warrior:Warriors can engage in metalworking. */
  static canMetalwork(player: Player): boolean {
    return player.baseClass === 'Warrior';
  }

  static chooseIngotType(type: string): string {
    switch(type) {
      case 'Copper': return 'Pillars';
      case 'Silver': return 'Hourglass';
      case 'Gold':   return 'Infinity';
    }
  }

  static async createIngotFor(player: Player, type: string): Promise<void> {
    type = capitalize(type);
    const brick = await player.$$room.itemCreator.getItemByName(`${type} Ingot (${this.chooseIngotType(type)})`);
    player.tradeSkillContainers.metalworking.craftResult = brick;

    if(player.calcSkillLevel(SkillClassNames.Metalworking) < 5) {
      player.gainSkill(SkillClassNames.Metalworking, 20);
    }
  }

  static getBuffForItem(item: Item, buffItem: Item, isCreate = false): any {

    // move prots over
    if(buffItem.itemClass === 'Fur') {
      return {
        fireResist: buffItem.stats.fireResist,
        iceResist: buffItem.stats.iceResist,
        poisonResist: buffItem.stats.poisonResist,
        diseaseResist: buffItem.stats.diseaseResist
      };
    }

    // move specific ingot buffs over
    const type = item.itemClass === 'Shield' || includes(ArmorClasses, item.itemClass) ? 'armor' : 'weapon';
    return get(isCreate ? ingotCraftBuffs : ingotUpgradeBuffs, [buffItem.name, type], {});
  }

  static successPercent(player: Player): number {
    const container = player.tradeSkillContainers.metalworking;
    const item = container.upgradeItem;
    const reagent = container.upgradeReagent;

    if(!item || !reagent) return 0;

    const enchantLevel = item.enchantLevel || 0;

    if(enchantLevel >= 5) return 0;
    if(!enchantLevel) return 100;

    const workSkill = player.calcSkillLevel(SkillClassNames.Metalworking);

    const requiredMetalSkillLevel = enchantLevel * 4;

    const workVal = clamp((workSkill - requiredMetalSkillLevel + 4) * 25, 0, 100);
    return workVal;
  }

  static async craft(player: Player): Promise<boolean> {
    const container = player.tradeSkillContainers.metalworking;
    const playerSkill = player.calcSkillLevel(SkillClassNames.Metalworking);

    const reagentNames = [container.craftItem, container.craftReagent].map(x => x.name);
    const recipeMatch = await player.$$room.itemCreator.getRecipe({
      recipeType: 'metalworking',
      ingredients: { $all: reagentNames, $size: reagentNames.length },
      requiredSkill: { $lte: playerSkill }
    });

    let success = true;
    let returnedItem = null;

    if(recipeMatch) {
      const { item, skillGained, maxSkillForGains, xpGained, transferOwner } = recipeMatch;
      const sampleItem = await player.$$room.itemCreator.getItemByName(item, player.$$room);

      const mold = includes(ArmorClasses, sampleItem.itemClass) ? 'Armor Mold' : 'Weapon Mold';
      returnedItem = await player.$$room.itemCreator.getItemByName(mold, player.$$room);
      returnedItem.encrust = { name: sampleItem.name, sprite: sampleItem.sprite };

      if(transferOwner) {
        returnedItem.owner = container.craftItem.owner;
      }

      // transfer upgrades
      returnedItem.previousUpgrades = container.craftItem.previousUpgrades;

      player.gainExp(xpGained);

      if(playerSkill < maxSkillForGains) {
        player.gainSkill(SkillClassNames.Metalworking, skillGained);
      }

    } else {
      returnedItem = container.craftItem;
      container.clearCraftIngredient();
      success = false;
    }

    container.clearCraft();
    container.craftResult = returnedItem;

    return success;
  }

  static upgrade(player: Player): boolean {
    const container = player.tradeSkillContainers.metalworking;
    const item = container.upgradeItem;
    const reagent = container.upgradeReagent;

    if(!item || !reagent) return false;
    if(!RollerHelper.XInOneHundred(this.successPercent(player))) {
      container.clearUpgradeIngredient();
      return false;
    }

    const buff = this.getBuffForItem(item, reagent);
    Object.keys(buff).forEach(stat => {
      item.stats[stat] = item.stats[stat] || 0;
      item.stats[stat] += buff[stat];
    });

    item.previousUpgrades = item.previousUpgrades || [];
    item.previousUpgrades.push(buff);

    item.enchantLevel = item.enchantLevel || 0;
    item.enchantLevel++;

    container.upgradeResult = item;
    container.clearUpgrade();

    if(player.calcSkillLevel(SkillClassNames.Metalworking) < 5) {
      player.gainSkill(SkillClassNames.Metalworking, 20);
    }
    return true;
  }

  static async forgeItem(player: Player): Promise<boolean> {
    const left = player.leftHand;
    const right = player.rightHand;

    const retroApplyUpgrades = cloneDeep(right.previousUpgrades) || [];

    const newItem = await player.$$room.itemCreator.getItemByName(right.encrust.name, player.$$room);

    const applyBuff = this.getBuffForItem(newItem, left, true);
    retroApplyUpgrades.push(applyBuff);

    retroApplyUpgrades.forEach(buff => {
      Object.keys(buff).forEach(stat => {
        newItem.stats[stat] = newItem.stats[stat] || 0;
        newItem.stats[stat] += buff[stat];
      });
    });

    newItem.previousUpgrades = right.previousUpgrades || [];
    newItem.previousUpgrades.push(applyBuff);

    player.setRightHand(newItem);
    player.setLeftHand(null);

    return false;
  }

}
