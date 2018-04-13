


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Disguise as CastEffect } from '../../../../../effects/buffs/Disguise';

export class Disguise extends Skill {

  static macroMetadata = {
    name: 'Disguise',
    macro: 'cast disguise',
    icon: 'duality',
    color: '#111',
    mode: 'autoActivate',
    tooltipDesc: 'Blend in with enemies. Cost: 100 HP',
    requireSkillLevel: 15
  };

  public targetsFriendly = true;

  public name = ['disguise', 'cast disguise'];

  canUse(user: Character, target: Character) {
    return false;
  }

  mpCost() { return 100; }

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
