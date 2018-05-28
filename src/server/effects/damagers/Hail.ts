
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class Hail extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 2.5], [6, 3], [11, 3.5], [16, 4], [21, 4.5]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    
    for(let i = 0; i < 2; i++) {
      this.magicalAttack(caster, target, {
        skillRef,
        atkMsg: `You fling hail at ${target.name}!`,
        defMsg: `${this.getCasterName(caster, target)} pelted you with bullets of hail!`,
        damage: +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`),
        damageClass: 'ice'
      });
    }
  }
}
