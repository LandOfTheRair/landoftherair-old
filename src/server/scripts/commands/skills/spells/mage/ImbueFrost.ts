
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ImbueFrost as CastEffect } from '../../../../../effects/augments/ImbueFrost';

export class ImbueFrost extends Skill {

  static macroMetadata = {
    name: 'ImbueFrost',
    macro: 'cast imbuefrost',
    icon: 'magic-palm',
    color: '#00b',
    mode: 'clickToTarget',
    tooltipDesc: 'Augment physical attacks to do bonus ice damage. Cost: 100 MP'
  };

  public targetsFriendly = true;

  public name = ['imbuefrost', 'cast imbuefrost'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('ImbueFrost');
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
