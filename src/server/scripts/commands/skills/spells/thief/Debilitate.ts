
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Debilitate as CastEffect } from '../../../../../effects/antibuffs/Debilitate';

export class Debilitate extends Skill {

  static macroMetadata = {
    name: 'Debilitate',
    macro: 'cast debilitate',
    icon: 'one-eyed',
    color: '#a00',
    mode: 'clickToTarget',
    tooltipDesc: 'Increase your targets vulnerability to backstabs. Cost: 100 HP'
  };

  public name = ['debilitate', 'cast debilitate'];
  public format = 'Target';

  mpCost() { return 100; }
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
