
import { isUndefined } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Light extends SpellEffect {

  maxSkillForSkillGain = 13;

  private range: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(isUndefined(this.range)) this.range = 1;

    target.$$room.removeDarkness(target.x, target.y, this.range, this.potency * 10);

    this.aoeAgro(caster, 10);
  }
}
