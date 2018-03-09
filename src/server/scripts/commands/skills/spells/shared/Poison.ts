
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../../effects/dots/Poison';

export class Poison extends Skill {

  static macroMetadata = {
    name: 'Poison',
    macro: 'cast poison',
    icon: 'poison-gas',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Inflict a deadly poison on your target. Cost: 15 MP'
  };

  public name = ['poison', 'cast poison'];
  public format = 'Target';

  mpCost() { return 15; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Poison');
  }

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
