
import { sampleSize } from 'lodash';

import { WeaponEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { LoweredDefenses } from '../antibuffs/LoweredDefenses';

export class Multistrike extends WeaponEffect {

  static get skillRequired() { return 13; }
  protected skillRequired = Multistrike.skillRequired;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    const numTargets = 3 + caster.getTraitLevelAndUsageModifier('Multitarget');

    const attacked = sampleSize(target.$$room.state.getAllInRange(target, 0, [caster.uuid]), numTargets);

    attacked.forEach(refTarget => {
      CombatHelper.physicalAttack(caster, refTarget);
    });

    if(attacked.length > 0) {
      const divisor = caster.getTraitLevel('Multifocus') ? 2 : 1;
      const debuff = new LoweredDefenses({ potency: attacked.length / divisor });
      debuff.cast(caster, caster);
    }
  }
}
