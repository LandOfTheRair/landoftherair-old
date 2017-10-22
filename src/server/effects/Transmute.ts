
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { ItemCreator } from '../helpers/item-creator';

export class Transmute extends SpellEffect {

  maxSkillForSkillGain = 11;

  skillFlag = (caster) => {
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    return SkillClassNames.Thievery;
  }

  async cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let valuePercent = 30;
    if(this.potency > 0)  valuePercent = 40;
    if(this.potency > 11) valuePercent = 50;
    if(this.potency > 21) valuePercent = 60;

    const groundItems = target.$$room.state.getGroundItems(target.x, target.y);

    let runningTotal = 0;

    Object.keys(groundItems).forEach(itemType => {
      // no transmuting coins
      if(itemType === 'Coin' || itemType === 'Corpse') return;

      groundItems[itemType].forEach(item => {
        // items with an owner are not transmuteable either
        if(item.owner) return;

        const value = item.value * valuePercent / 100;
        runningTotal += Math.max(value, 1);
        caster.$$room.state.removeItemFromGround(item);
      });
    });

    if(runningTotal === 0) return caster.sendClientMessage('There is nothing here that you can transmute!');

    caster.sendClientMessageToRadius('You hear metal coins clinking together.', 4);

    const gold = await ItemCreator.getGold(Math.floor(runningTotal));
    caster.$$room.addItemToGround(caster, gold);
  }
}
