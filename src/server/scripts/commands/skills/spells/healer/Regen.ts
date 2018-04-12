
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Regen as CastEffect } from '../../../../../effects/cures/Regen';

export class Regen extends Skill {

  static macroMetadata = {
    name: 'Regen',
    macro: 'cast regen',
    icon: 'star-swirl',
    color: '#00c',
    mode: 'clickToTarget',
    tooltipDesc: 'Cast a restorative aura on the target. Cost: 30 MP',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['regen', 'cast regen'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Regen');
  }

  mpCost() { return 30; }
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
