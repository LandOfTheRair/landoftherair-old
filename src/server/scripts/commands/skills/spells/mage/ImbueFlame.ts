
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ImbueFlame as CastEffect } from '../../../../../effects/augments/ImbueFlame';

export class ImbueFlame extends Skill {

  static macroMetadata = {
    name: 'ImbueFlame',
    macro: 'cast imbueflame',
    icon: 'magic-palm',
    color: '#a00',
    mode: 'clickToTarget',
    tooltipDesc: 'Augment physical attacks to do bonus fire damage. Cost: 100 MP',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['imbueflame', 'cast imbueflame'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('ImbueFlame');
  }

  mpCost() { return 100; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
