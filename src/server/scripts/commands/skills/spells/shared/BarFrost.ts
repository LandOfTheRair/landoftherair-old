


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { BarFrost as CastEffect } from '../../../../../effects/buffs/BarFrost';

export class BarFrost extends Skill {

  static macroMetadata = {
    name: 'BarFrost',
    macro: 'cast barfrost',
    icon: 'rosa-shield',
    color: '#000080',
    mode: 'clickToTarget',
    tooltipDesc: 'Shield frost damage for a single target. Cost: 20 MP'
  };

  public name = ['barfrost', 'cast barfrost'];
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
