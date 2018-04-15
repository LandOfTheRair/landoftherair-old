
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Firethorns as CastEffect } from '../../../../../effects/auras/Firethorns';

export class Firethorns extends Skill {

  static macroMetadata = {
    name: 'Firethorns',
    macro: 'cast firethorns',
    icon: 'barbed-coil',
    color: '#f00',
    mode: 'clickToTarget',
    tooltipDesc: 'Physical attackers take fire damage. Cost: 100 MP'
  };

  public targetsFriendly = true;

  public name = ['firethorns', 'cast firethorns'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Firethorns');
  }

  mpCost() { return 100; }
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
