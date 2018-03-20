
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Invisible as CastEffect } from '../../../../../effects/buffs/Invisible';

export class Invisibility extends Skill {

  static macroMetadata = {
    name: 'Invisibility',
    macro: 'cast invisibility',
    icon: 'invisible',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'Become invisible to the average vision. Cost: 100 MP'
  };

  public targetsFriendly = true;

  public name = ['invisibility', 'cast invisibility'];
  public format = 'Target';

  // npcs can only cast invis on themselves to prevent shenanigans
  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Invisibility') && user === target;
  }

  mpCost() { return 100; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
