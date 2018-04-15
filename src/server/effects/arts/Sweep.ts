
import { sampleSize } from 'lodash';

import { WeaponEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { LoweredDefenses } from '../antibuffs/LoweredDefenses';

export class Sweep extends WeaponEffect {

  static get skillRequired() { return 1; }
  protected skillRequired = Sweep.skillRequired;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    const numTargets = 12;

    const attacked = sampleSize(target.$$room.state.getAllInRange(target, 0, [caster.uuid]), numTargets);

    attacked.forEach(refTarget => {
      CombatHelper.physicalAttack(caster, refTarget, { isKick: true });
    });

    if(attacked.length > 0) {
      const debuff = new LoweredDefenses({ potency: 4 });
      debuff.cast(caster, caster);
    }
  }
}
