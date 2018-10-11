
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class EnergyWave extends SpellEffect {

  maxSkillForSkillGain = 15;
  skillMults = [[0, 0.7], [6, 1.2], [11, 1.7], [16, 2.2], [21, 2.7]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const totalRadius = 1 + (target.getTraitLevel('EnergyWaveWiden') ? 1 : 0);

    this.effectMessageRadius(target, { message: `You feel a wave of energy pulse outwards from ${target.name}.`, subClass: 'combat magic' }, 5, [caster.uuid]);

    const attacked = target.$$room.state.getAllInRange(target, totalRadius, [caster.uuid], false);

    attacked.forEach(refTarget => {
      const damage = RollerHelper.diceRoll(this.getTotalDamageRolls(caster), this.getTotalDamageDieSize(caster));

      this.magicalAttack(caster, refTarget, {
        skillRef,
        atkMsg: `You blast %0 with a wave of energy!`,
        defMsg: `%0 blasted you with a wave of energy!`,
        damage,
        damageClass: 'energy',
        isAOE: true
      });
    });
  }
}
