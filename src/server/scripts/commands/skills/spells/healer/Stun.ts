
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Stun as CastEffect } from '../../../../../effects/antibuffs/Stun';

export class Stun extends Skill {

  static macroMetadata = {
    name: 'Stun',
    macro: 'cast stun',
    icon: 'knockout',
    color: '#990',
    mode: 'clickToTarget',
    tooltipDesc: 'Attempt to stun a single target. Cost: 40 MP'
  };

  public name = ['stun', 'cast stun'];
  public format = 'Target';

  mpCost() { return 40; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args);
    if(!target) return;

    if(target === user) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
