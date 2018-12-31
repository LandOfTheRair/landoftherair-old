
import { IPlayer, SkillClassNames } from '../../../shared/interfaces/character';
import { capitalize, clamp, includes, get, cloneDeep } from 'lodash';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { ArmorClasses, IItem, ShieldClasses } from '../../../shared/interfaces/item';

const ingotCraftBuffs = {
  'Copper Ingot (Pillars)': {
    weapon: { str: 2 },
    armor:  { mitigation: 5 },
    ring:   { physicalResist: 10, magicalResist: 10 }
  },
  'Silver Ingot (Hourglass)': {
    weapon: { weaponArmorClass: 10 },
    armor:  { armorClass: 8 },
    ring:   { armorClass: 3 }
  },
  'Gold Ingot (Infinity)': {
    weapon: { agi: 2 },
    armor:  { hp: 75 },
    ring:   { perception: 50 }
  }
};

const ingotUpgradeBuffs = {
  'Copper Ingot (Pillars)': {
    weapon: { weaponDamageRolls: 3 },
    armor:  { mitigation: 2 },
    ring:   {}
  },
  'Silver Ingot (Hourglass)': {
    weapon: { weaponArmorClass: 4 },
    armor:  { armorClass: 3 },
    ring:   {}
  },
  'Gold Ingot (Infinity)': {
    weapon: { offense: 2, defense: 2, accuracy: 2 },
    armor:  { hp: 20 },
    ring:   {}
  }
};

export class MetalworkingHelper {

  /** PERK:CLASS:Warrior:Warriors can engage in metalworking. */
  static canMetalwork(player: IPlayer): boolean {
    return player.baseClass === 'Warrior';
  }

  static chooseIngotType(type: string): string {
    switch(type) {
      case 'Copper': return 'Pillars';
      case 'Silver': return 'Hourglass';
      case 'Gold':   return 'Infinity';
    }
  }

  static getUpgradeCreateType(item: IItem): 'armor'|'weapon'|'ring' {
    if(includes(ShieldClasses, item.itemClass)) return 'armor';
    if(item.itemClass === 'Ring')               return 'ring';
    if(includes(ArmorClasses, item.itemClass))  return 'armor';

    return 'weapon';
  }

  static async createIngotFor(player: IPlayer, type: string): Promise<void> {
    type = capitalize(type);
    const brick = await player.$$room.itemCreator.getItemByName(`${type} Ingot (${this.chooseIngotType(type)})`);
    player.tradeSkillContainers.metalworking.craftResult = brick;

    if(player.calcBaseSkillLevel(SkillClassNames.Metalworking) < 5) {
      player.gainSkill(SkillClassNames.Metalworking, 20, true);
    }
  }

  static getBuffForItem(item: IItem, buffItem: IItem, isCreate = false): any {

    // move prots over
    if(buffItem.itemClass === 'Fur') {
      const buff = {};

      ['fireResist', 'iceResist', 'poisonResist', 'diseaseResist', 'energyResist', 'necroticResist', 'magicalResist', 'physicalResist'].forEach(stat => {
        if(!buffItem.stats[stat]) return;
        buff[stat] = buffItem.stats[stat];
      });

      return buff;
    }

    if(buffItem.stats) return buffItem.stats;

    // move specific ingot buffs over
    const type = MetalworkingHelper.getUpgradeCreateType(item);
    return get(isCreate ? ingotCraftBuffs : ingotUpgradeBuffs, [buffItem.name, type], {});
  }

  static successPercent(player: IPlayer): number {
    const container = player.tradeSkillContainers.metalworking;
    const item = container.upgradeItem;
    const reagent = container.upgradeReagent;

    if(!item || !reagent) return 0;

    if(get(reagent, 'previousUpgrades', []).length > 0) return 0;

    const enchantLevel = item.enchantLevel || 0;

    if(enchantLevel >= 5) return 0;
    if(!enchantLevel) return 100;

    const workSkill = player.calcSkillLevel(SkillClassNames.Metalworking);

    const requiredMetalSkillLevel = enchantLevel * 4;

    const workVal = clamp((workSkill - requiredMetalSkillLevel + 4) * 25, 0, 100);
    return workVal;
  }

  static async craft(player: IPlayer): Promise<boolean> {
    const container = player.tradeSkillContainers.metalworking;
    const playerSkill = player.calcSkillLevel(SkillClassNames.Metalworking);

    player.setTradeskillBusy();

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
      returnedItem.upgrades = container.craftItem.upgrades;

      player.gainExp(xpGained);

      if(playerSkill < maxSkillForGains) {
        player.gainSkill(SkillClassNames.Metalworking, skillGained, true);
      }

      player.$$statistics.craftMetalworking();

    } else {
      returnedItem = container.craftItem;
      container.clearCraftIngredient();
      success = false;
    }

    container.clearCraft();
    container.craftResult = returnedItem;

    player.setTradeskillFree();

    return success;
  }

  static doSpecificItemUpgrade(targetItem: IItem, buffItem: IItem): void {
    const buff = this.getBuffForItem(targetItem, buffItem);

    targetItem.addUpgrade({
      name: buffItem.name,
      sprite: buffItem.sprite,
      stats: buff
    });
  }

  static upgrade(player: IPlayer): boolean {
    const container = player.tradeSkillContainers.metalworking;
    const item = container.upgradeItem;
    const reagent = container.upgradeReagent;

    if(!item || !reagent) return false;
    if(!RollerHelper.XInOneHundred(this.successPercent(player))) {
      container.clearUpgradeIngredient();
      return false;
    }

    player.setTradeskillBusy();

    this.doSpecificItemUpgrade(item, reagent);
    player.$$statistics.craftMetalworking();

    container.upgradeResult = item;
    container.clearUpgrade();

    if(player.calcBaseSkillLevel(SkillClassNames.Metalworking) < 5) {
      player.gainSkill(SkillClassNames.Metalworking, 20, true);
    }

    player.setTradeskillFree();

    return true;
  }

  static async forgeItem(player: IPlayer): Promise<boolean> {
    const left = player.leftHand;
    const right = player.rightHand;

    const retroApplyUpgrades = cloneDeep(right.upgrades) || [];

    const newItem = await player.$$room.itemCreator.getItemByName(right.encrust.name, player.$$room);

    const applyBuff = this.getBuffForItem(newItem, left, true);

    retroApplyUpgrades.forEach(upg => newItem.addUpgrade(upg));

    const applyUpg = {
      name: left.name,
      sprite: left.sprite,
      permanent: true,
      stats: applyBuff
    };

    newItem.addUpgrade(applyUpg);

    player.setRightHand(newItem);
    player.setLeftHand(null);

    return false;
  }

}
