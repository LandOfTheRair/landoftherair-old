
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { DarkVision as CastEffect } from '../../../../../effects/buffs/DarkVision';
import { CharacterHelper } from '../../../../../helpers/character/character-helper';

export class DarkVision extends Skill {

  static macroMetadata = {
    name: 'DarkVision',
    macro: 'cast darkvision',
    icon: 'angry-eyes',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'See in the darkness. Cost: 25 MP'
  };

  public targetsFriendly = true;

  public name = ['darkvision', 'cast darkvision'];

  mpCost() { return 25; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('DarkVision');
  }

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
