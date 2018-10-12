
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Plague as CastEffect } from '../../../../../effects/dots/Plague';

export class Plague extends Skill {

  static macroMetadata = {
    name: 'Plague',
    macro: 'cast plague',
    icon: 'death-zone',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Inflict a deadly plague on your target. Cost: 15 MP'
  };

  public name = ['plague', 'cast plague'];
  public format = 'Target';

  mpCost() { return 15; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Plague');
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
