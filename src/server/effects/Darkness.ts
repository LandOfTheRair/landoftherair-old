
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Darkness extends SpellEffect {

  maxSkillForSkillGain = 11;
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    // skill - 7 in minutes
    const duration = this.potency - 7;

    target.$$room.createDarkness(target.x, target.y, 1, duration);

  }
}
