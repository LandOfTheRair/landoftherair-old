
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { Light } from '../misc/Light';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class HolyFire extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 4], [11, 5], [21, 6]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    let isCrit = false;

    const holyAfflictionChance = caster.getTraitLevelAndUsageModifier('HolyAffliction');
    if(RollerHelper.XInOneHundred(holyAfflictionChance)) {
      isCrit = true;
    }

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You ${isCrit ? 'critically ' : ' '}scorch ${target.name}!`,
      defMsg: `${this.getCasterName(caster, target)} ${isCrit ? 'critically ' : ' '}scorched you with holy fire!`,
      damage: isCrit ? damage * 3 : damage,
      damageClass: 'fire'
    });

    if(caster.getTraitLevel('HolyIllumination')) {
      const light = new Light({ radius: 0 });
      light.cast(caster, target);
    }
  }
}
