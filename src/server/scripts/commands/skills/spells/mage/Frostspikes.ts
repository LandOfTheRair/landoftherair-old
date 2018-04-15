
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Frostspikes as CastEffect } from '../../../../../effects/auras/Frostspikes';

export class Frostspikes extends Skill {

  static macroMetadata = {
    name: 'Frostspikes',
    macro: 'cast frostspikes',
    icon: 'barbed-coil',
    color: '#000080',
    mode: 'clickToTarget',
    tooltipDesc: 'Physical attackers take ice damage. Cost: 100 MP'
  };

  public targetsFriendly = true;

  public name = ['frostspikes', 'cast frostspikes'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Frostspikes');
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
