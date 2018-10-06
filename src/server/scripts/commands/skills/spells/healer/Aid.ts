
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Aid as CastEffect } from '../../../../../effects';

export class Aid extends Skill {

  static macroMetadata = {
    name: 'Aid',
    macro: 'cast aid',
    icon: 'three-friends',
    color: '#00c',
    mode: 'clickToTarget',
    tooltipDesc: 'Increase the targets DEX and offensive combat rating. Cost: 50 MP',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['aid', 'cast aid'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Aid');
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
