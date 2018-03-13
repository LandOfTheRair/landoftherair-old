
import { sampleSize } from 'lodash';

import { WeaponEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { LoweredDefenses } from '../antibuffs/LoweredDefenses';

export class Multistrike extends WeaponEffect {

  static get skillRequired() { return 17; }
  protected skillRequired = Multistrike.skillRequired;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    const attacked = sampleSize(target.$$room.state.getAllInRange(target, 0, [caster.uuid]), 4);

    attacked.forEach(refTarget => {
      CombatHelper.physicalAttack(caster, refTarget);
    });

    if(attacked.length > 0) {
      const debuff = new LoweredDefenses({});
      debuff.cast(caster, caster);
    }
  }
}
