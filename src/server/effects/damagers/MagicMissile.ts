
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class MagicMissile extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 1], [11, 2.5], [21, 3]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You fling magic missiles at ${target.name}!`,
      defMsg: `${this.getCasterName(caster, target)} hit you with magic missiles!`,
      damage,
      damageClass: 'energy'
    });
  }
}
