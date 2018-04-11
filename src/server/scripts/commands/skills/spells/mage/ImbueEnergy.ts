
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ImbueEnergy as CastEffect } from '../../../../../effects/augments/ImbueEnergy';

export class ImbueEnergy extends Skill {

  static macroMetadata = {
    name: 'ImbueEnergy',
    macro: 'cast imbueenergy',
    icon: 'magic-palm',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Augment physical attacks to do bonus energy damage. Cost: 100 MP',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['imbueenergy', 'cast imbueenergy'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('ImbueEnergy');
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
