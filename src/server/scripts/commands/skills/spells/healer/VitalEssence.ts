
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { VitalEssence as CastEffect } from '../../../../../effects/buffs/VitalEssence';

export class VitalEssence extends Skill {

  static macroMetadata = {
    name: 'VitalEssence',
    macro: 'cast vitalessence',
    icon: 'bell-shield',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Boost maximum vitality and armor for a single target. Cost: 200 MP',
    requireSkillLevel: 15
  };

  public targetsFriendly = true;

  public name = ['vitalessence', 'cast vitalessence'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('VitalEssence');
  }

  mpCost() { return 200; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.isValidBuffTarget(user, target)) return user.sendClientMessage('You cannot target that person with this spell.');

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
