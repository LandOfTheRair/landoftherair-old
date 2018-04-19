
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Secondwind as CastEffect } from '../../../../../effects/buffs/Secondwind';

export class Secondwind extends Skill {

  static macroMetadata = {
    name: 'Secondwind',
    macro: 'cast secondwind',
    icon: 'wing-cloak',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Prevent losing gear on death. Cost: 250 MP',
    skillTPCost: 20
  };

  public name = ['secondwind', 'cast secondwind'];

  mpCost() { return 250; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return false;
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
