
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class EnergyWave extends SpellEffect {

  maxSkillForSkillGain = 11;
  skillMults = [[0, 0.7], [11, 1.6], [21, 2.7]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    target.sendClientMessageToRadius({ message: `You feel a wave of energy pulse outwards from ${target.name}.`, subClass: 'combat magic' }, 5, [caster.uuid]);

    const totalRadius = 1 + (target.getTraitLevel('EnergyWaveWiden') ? 1 : 0);

    const attacked = target.$$room.state.getAllInRange(target, totalRadius, [caster.uuid]);

    attacked.forEach(refTarget => {
      const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

      const atkName = refTarget.name;

      this.magicalAttack(caster, refTarget, {
        skillRef,
        atkMsg: `You blast ${atkName} with a wave of energy!`,
        defMsg: `${this.getCasterName(caster, target)} blasted you with a wave of energy!`,
        damage,
        damageClass: 'energy'
      });
    });
  }
}
