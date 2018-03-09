
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { BarWater as CastEffect } from '../../../../../effects/buffs/BarWater';

export class BarWater extends Skill {

  static macroMetadata = {
    name: 'BarWater',
    macro: 'cast barwater',
    icon: 'rosa-shield',
    color: '#208aec',
    mode: 'clickToTarget',
    tooltipDesc: 'Shield water damage for a single target. Cost: 20 MP'
  };

  public name = ['barwater', 'cast barwater'];
  public format = 'Target';

  mpCost() { return 20; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.isValidBuffTarget(user, target)) return user.sendClientMessage('You cannot target that person with this spell.');

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
