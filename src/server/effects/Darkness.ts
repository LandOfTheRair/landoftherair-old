
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Darkness extends SpellEffect {

  maxSkillForSkillGain = 11;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const mult = caster.baseClass === 'Thief' ? 2 : 1;

    // skill - 7 in quarter-minutes
    const duration = Math.max(1, this.potency - 7) * mult;

    caster.sendClientMessage('You cloak the area in a veil of darkness.');

    target.$$room.createDarkness(target.x, target.y, caster.baseClass === 'Thief' ? 0 : 1, duration);

  }
}
