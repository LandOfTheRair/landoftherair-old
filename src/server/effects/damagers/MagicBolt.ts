
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class MagicBolt extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 3], [11, 4], [21, 6]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You fire a magic bolt at ${target.name}!`,
      defMsg: `${this.getCasterName(caster, target)} hit you with a magic bolt!`,
      damage,
      damageClass: 'energy'
    });
  }
}
