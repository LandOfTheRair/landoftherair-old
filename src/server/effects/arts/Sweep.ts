
import { WeaponEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { LoweredDefenses } from '../antibuffs/LoweredDefenses';

export class Sweep extends WeaponEffect {

  static get skillRequired() { return 1; }
  protected skillRequired = Sweep.skillRequired;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    const numTargets = 9;

    const superSweepLevel = caster.getTraitLevel('Supersweep');
    const attacked = target.$$room.state.getAllInRange(target, superSweepLevel, [caster.uuid], false ).slice(0, numTargets);

    const damageMult = 1 + caster.getTraitLevelAndUsageModifier('ImprovedSweep');

    attacked.forEach(refTarget => {
      if(caster.isPlayer() && refTarget.isPlayer()) return;
      CombatHelper.physicalAttack(caster, refTarget, { damageMult, isKick: true, attackRange: superSweepLevel });
    });

    if(attacked.length > 0 && !caster.getTraitLevelAndUsageModifier('ImprovedSweep')) {
      const debuff = new LoweredDefenses({ potency: 4 });
      debuff.cast(caster, caster);
    }
  }
}
