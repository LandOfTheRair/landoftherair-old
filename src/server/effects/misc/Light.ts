
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Light extends SpellEffect {

  maxSkillForSkillGain = 13;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    target.$$room.removeDarkness(target.x, target.y, 1);

    this.aoeAgro(caster, 10);
  }
}
