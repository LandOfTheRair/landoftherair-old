
import { Skill } from '../../../../../base/Skill';
import { Character } from 'shared/models/character';
import { HolyAura as CastEffect } from '../../../../../effects/buffs/HolyAura';

export class HolyAura extends Skill {

  static macroMetadata = {
    name: 'HolyAura',
    macro: 'cast holyaura',
    icon: 'aura',
    color: '#aa0',
    mode: 'clickToTarget',
    tooltipDesc: 'Become invulnerable to damage for a short period of time. Cost: 75 MP'
  };

  public targetsFriendly = true;

  public name = ['holyaura', 'cast holyaura'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('HolyAura') && !target.hasEffect('RecentlyShielded');
  }

  mpCost() { return 75; }
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
