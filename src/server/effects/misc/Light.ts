
import { isUndefined } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Light extends SpellEffect {

  maxSkillForSkillGain = 13;

  private radius: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(isUndefined(this.radius)) this.radius = 1;

    target.$$room.removeDarkness(target.x, target.y, this.radius, this.potency);

    this.aoeAgro(caster, 10);
  }
}
