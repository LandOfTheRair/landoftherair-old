
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Transmute extends SpellEffect {

  maxSkillForSkillGain = 11;

  async cast(caster: Character, target: Character|{ x: number, y: number }, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let valuePercent = 10;
    if(this.potency > 0)  valuePercent = 20;
    if(this.potency > 11) valuePercent = 30;
    if(this.potency > 21) valuePercent = 40;

    /** PERK:CLASS:THIEF:Thieves get 150% of the normal item transmute value. */
    if(caster.baseClass === 'Thief') {
      valuePercent = Math.floor(valuePercent * 1.5);
      valuePercent += caster.getTraitLevelAndUsageModifier('PhilosophersStone');
    }

    const groundItems = caster.$$room.state.getGroundItems(target.x, target.y);

    let runningTotal = 0;

    Object.keys(groundItems).forEach(itemType => {
      // no transmuting coins
      if(itemType === 'Coin' || itemType === 'Corpse') return;

      groundItems[itemType].forEach(item => {
        // items with an owner are not transmuteable either
        if(item.owner) return;

        const value = caster.sellValue(item) * valuePercent / 100;
        runningTotal += Math.max(value, 1);
        caster.$$room.removeItemFromGround(item);
      });
    });

    if(runningTotal === 0) return;

    this.effectMessageRadius(caster, 'You hear metal coins clinking together.', 4);

    const gold = await caster.$$room.itemCreator.getGold(Math.floor(runningTotal));
    caster.$$room.addItemToGround(target, gold);
  }
}
