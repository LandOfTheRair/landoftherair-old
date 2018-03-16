
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { MagicShield as CastEffect } from '../../../../../effects/buffs/MagicShield';

export class MagicShield extends Skill {

  static macroMetadata = {
    name: 'Magic Shield',
    macro: 'cast magicshield',
    icon: 'energy-shield',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Negate some physical damage. Cost: 100 MP'
  };

  public targetsFriendly = true;

  public name = ['magicshield', 'cast magicshield'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('MagicShield');
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
