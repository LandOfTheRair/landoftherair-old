
import { sampleSize } from 'lodash';

import { WeaponEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class Blindstrike extends WeaponEffect {

  static get skillRequired() { return 10; }
  protected skillRequired = Blindstrike.skillRequired;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    const attacked = sampleSize(target.$$room.state.getAllInRange(target, 0, [caster.uuid], false), 1);

    attacked.forEach(refTarget => {
      CombatHelper.physicalAttack(caster, refTarget);
    });
  }
}
