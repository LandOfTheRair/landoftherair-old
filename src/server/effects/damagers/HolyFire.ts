
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { Light } from '../misc/Light';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { SearingPurification } from '../dots/SearingPurification';

export class HolyFire extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 1.5], [6, 2], [11, 2.5], [16, 3], [21, 3.5]];

  iconData = {
    name: 'fireflake',
    color: '#f50',
    tooltipDesc: 'Being purified by holy light.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const holyAfflictionChance = caster.getTraitLevelAndUsageModifier('HolyAffliction');

    const attacked = caster.$$room.state.getAllInRange(target, 0, [], false);
    attacked.forEach(refTarget => {

      const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

      let isCrit = false;
      let damageMultiplier = 1;

      if(RollerHelper.XInOneHundred(holyAfflictionChance)) {
        isCrit = true;
        damageMultiplier += caster.getTraitLevel('HolyAffliction') * 0.5;
      }

      this.magicalAttack(caster, refTarget, {
        skillRef,
        atkMsg: `You ${isCrit ? 'critically ' : ' '}scorch %0!`,
        defMsg: `%0 ${isCrit ? 'critically ' : ' '}scorched you with holy fire!`,
        damage: Math.floor(damage * damageMultiplier),
        damageClass: 'fire'
      });

      if(caster.getTraitLevel('HolyIllumination')) {
        const light = new Light({ radius: 0 });
        light.cast(caster, refTarget);
      }

      if(caster.getTraitLevel('SearingPurification') && !refTarget.hasEffect('RecentlyPurified')) {
        const searingPurification = new SearingPurification({ potency: this.potency });
        searingPurification.cast(caster, refTarget, skillRef);
      }
    });
  }
}
