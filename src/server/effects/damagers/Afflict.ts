
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class Afflict extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 2.75], [6, 3.25], [11, 3.75], [16, 4.25], [21, 4.75]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    let isCrit = false;
    let damageMultiplier = 1;

    const holyAfflictionChance = caster.getTraitLevelAndUsageModifier('HolyAffliction');
    if(RollerHelper.XInOneHundred(holyAfflictionChance)) {
      isCrit = true;
      damageMultiplier += caster.getTraitLevel('HolyAffliction') * 0.5;
    }

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You ${isCrit ? 'critically ' : ' '}afflict %0!`,
      defMsg: `%0 ${isCrit ? 'critically ' : ' '}afflicted you!`,
      damage: Math.floor(damage * damageMultiplier),
      damageClass: 'necrotic'
    });
  }
}
