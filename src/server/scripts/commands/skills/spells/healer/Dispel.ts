
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Dispel as CastEffect } from '../../../../../effects/misc/Dispel';

export class Dispel extends Skill {

  static macroMetadata = {
    name: 'Dispel',
    macro: 'cast dispel',
    icon: 'broken-shield',
    color: '#600',
    mode: 'clickToTarget',
    tooltipDesc: 'Remove a buff from a target. Cost: 25 MP',
    skillTPCost: 20
  };

  public name = ['dispel', 'cast dispel'];

  mpCost() { return 25; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && target.dispellableEffects.length > 0;
  }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
