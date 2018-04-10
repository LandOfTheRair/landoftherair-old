
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Absorption as CastEffect } from '../../../../../effects/buffs/Absorption';

export class Absorption extends Skill {

  static macroMetadata = {
    name: 'Absorption',
    macro: 'cast absorption',
    icon: 'magic-swirl',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Absorb all types of magic. Cost: 100 MP',
    requireCharacterLevel: 10,
    requireSkillLevel: 7
  };

  public targetsFriendly = true;

  public name = ['absorption', 'cast absorption'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Absorption');
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
