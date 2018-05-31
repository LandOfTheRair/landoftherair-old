
import { Player } from '../../../shared/models/player';
import { Item, EquippableItemClassesWithWeapons } from '../../../shared/models/item';

import { includes, random, clone, clamp, capitalize } from 'lodash';
import { SkillClassNames } from '../../../shared/models/character';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class SpellforgingHelper {

  static canSpellforge(player: Player): boolean {
    return player.calcSkillLevel(SkillClassNames.Conjuration) >= 1;
  }

  static canDisenchant(item: Item): boolean {
    return includes(EquippableItemClassesWithWeapons, item.itemClass);
  }

  static async disenchant(player: Player): Promise<string> {
    const container = player.tradeSkillContainers.spellforging;
    const item = container.modifyItem;

    let enosDust = 0;
    let owtsDust = 0;

    const itemQuality = item.quality || 0;

    enosDust += 1 + (itemQuality * 2);

    if(random(1, 5) <= itemQuality) owtsDust++;
    if(itemQuality === 5) owtsDust += 3;

    container.clearReagents();
    container.gainDust('enos', enosDust);
    container.gainDust('owts', owtsDust);

    player.gainExp(200 * (itemQuality + 1));

    const gainedSkill = Math.max(1, 5 - player.calcSkillLevel(SkillClassNames.Spellforging)) + itemQuality;
    player.gainSkill(SkillClassNames.Spellforging, gainedSkill);

    let retval = `You have gained ${enosDust} Enos Dust`;
    if(owtsDust > 0) retval = `${retval} and ${owtsDust} Owts Dust`;
    retval = `${retval} for disenchanting your ${item.itemClass.toLowerCase()}.`;
    return retval;
  }

  static successPercent(player: Player): number {
    const container = player.tradeSkillContainers.spellforging;
    const item = container.modifyItem;
    const reagent = container.reagent;

    if(!item || !reagent) return 0;

    const conjSkill = player.calcSkillLevel(SkillClassNames.Conjuration);
    const forgeSkill = player.calcSkillLevel(SkillClassNames.Spellforging);

    if(reagent.itemClass === 'Rock') {
      const enchantLevel = item.enchantLevel || 0;

      if(enchantLevel >= 5) return 0;
      if(!enchantLevel) return 100;

      const requiredForgeSkillLevel = enchantLevel * 4;
      const requiredConjSkillLevel = enchantLevel * 5;

      const forgeVal = clamp((forgeSkill - requiredForgeSkillLevel + 4) * 25, 0, 100);
      const conjVal = clamp((conjSkill - requiredConjSkillLevel + 5) * 20, 0, 100);

      return Math.floor((forgeVal + conjVal) / 2);
    }

    if(reagent.itemClass === 'Scroll') {
      const level = reagent.trait.level;
      const requiredSkillLevel = (level - 1) * 5;

      if(forgeSkill >= requiredSkillLevel) return 100;
      return clamp((forgeSkill - requiredSkillLevel + 5) * 20, 0, 100);
    }
  }

  static enchant(player: Player): boolean {
    const container = player.tradeSkillContainers.spellforging;
    const item = container.modifyItem;
    const reagent = container.reagent;

    if(!RollerHelper.XInOneHundred(this.successPercent(player))) {
      container.clearIngredient();
      return false;
    }

    if(reagent.itemClass === 'Rock') {
      item.enchantLevel = item.enchantLevel || 0;
      item.enchantLevel++;

      if(includes(reagent.name, 'Enos')) {

        item.stats.accuracy = item.stats.accuracy || 0;
        item.stats.accuracy++;

        item.stats.offense = item.stats.offense || 0;
        item.stats.offense++;

        item.stats.defense = item.stats.defense || 0;
        item.stats.defense++;
      }

      if(includes(reagent.name, 'Owts')) {
        item.tier += 1;
      }

      container.result = item;
      container.clearReagents();
      player.gainSkill(SkillClassNames.Spellforging, item.enchantLevel * 25);
    }

    if(reagent.itemClass === 'Scroll') {
      item.trait = clone(reagent.trait);
      container.result = item;
      container.clearReagents();
      player.gainSkill(SkillClassNames.Spellforging, item.trait.level * 20);
      return true;
    }

    return true;
  }

  static async createBrickFor(player: Player, type: string): Promise<void> {
    type = capitalize(type);
    const brick = await player.$$room.itemCreator.getItemByName(`Enchanting Brick - ${type}`);
    player.tradeSkillContainers.spellforging.result = brick;

    if(player.calcSkillLevel(SkillClassNames.Spellforging) < 5) {
      player.gainSkill(SkillClassNames.Spellforging, 1);
    }
  }
}
