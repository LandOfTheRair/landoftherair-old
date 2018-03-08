
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { BarFire as CastEffect } from '../../../../../effects/buffs/BarFire';

export class BarFire extends Skill {

  static macroMetadata = {
    name: 'BarFire',
    macro: 'cast barfire',
    icon: 'rosa-shield',
    color: '#DC143C',
    mode: 'clickToTarget',
    tooltipDesc: 'Shield fire damage for a single target. Cost: 20 MP'
  };

  public name = ['barfire', 'cast barfire'];
  public format = 'Target';

  mpCost() { return 20; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { gameState, args, effect }) {

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
