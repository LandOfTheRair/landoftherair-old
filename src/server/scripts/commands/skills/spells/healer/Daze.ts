
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Daze as CastEffect } from '../../../../../effects';

export class Daze extends Skill {

  static macroMetadata = {
    name: 'Daze',
    macro: 'cast daze',
    icon: 'knockout',
    color: '#055',
    mode: 'clickToTarget',
    tooltipDesc: 'Attempt to daze a single target. Cost: 50 MP'
  };

  public name = ['daze', 'cast daze'];
  public format = 'Target';

  mpCost() { return 50; }
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
