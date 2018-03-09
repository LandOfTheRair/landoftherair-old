
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Antidote as CastEffect } from '../../../../../effects/cures/Antidote';

export class Antidote extends Skill {

  static macroMetadata = {
    name: 'Antidote',
    macro: 'cast antidote',
    icon: 'miracle-medecine',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Cure poison on a single target. Cost: 10 MP'
  };

  public name = ['antidote', 'cast antidote'];
  public format = 'Target';

  mpCost() { return 10; }
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
