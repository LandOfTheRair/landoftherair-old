
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Haste as CastEffect } from '../../../../../effects/buffs/Haste';

export class Haste extends Skill {

  static macroMetadata = {
    name: 'Haste',
    macro: 'cast haste',
    icon: 'time-trap',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Act twice as fast. Cost: 200 MP',
    requireCharacterLevel: 20,
    requireSkillLevel: 15,
    skillTPCost: 20
  };

  public targetsFriendly = true;

  public name = ['haste', 'cast haste'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Haste');
  }

  mpCost() { return 200; }
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
