
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class HolyFire extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 3], [11, 4], [21, 5]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You scorch ${target.name}!`,
      defMsg: `${caster.name} scorched you with holy fire!`,
      damage,
      damageClass: 'fire'
    });
  }
}
