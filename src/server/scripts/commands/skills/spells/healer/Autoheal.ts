
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Autoheal as CastEffect } from '../../../../../effects/buffs/Autoheal';

export class Autoheal extends Skill {

  static macroMetadata = {
    name: 'Autoheal',
    macro: 'cast autoheal',
    icon: 'self-love',
    color: '#00c',
    mode: 'clickToTarget',
    tooltipDesc: 'Automatically heal when health gets too low. Cost: 50 MP',
    requireSkillLevel: 15
  };

  public targetsFriendly = true;

  public name = ['autoheal', 'cast autoheal'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Autoheal');
  }

  mpCost() { return 50; }
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
