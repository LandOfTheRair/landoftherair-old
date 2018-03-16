
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ChannelShadowClones as CastEffect } from '../../../../../effects/channels/ChannelShadowClones';

export class ShadowClones extends Skill {

  static macroMetadata = {
    name: 'ShadowClones',
    macro: 'cast shadowclones',
    icon: 'dark-squad',
    color: '#111',
    mode: 'autoActivate',
    tooltipDesc: 'Summon some shadow backup to help you slaughter your foes. Cost: 300 HP'
  };

  public targetsFriendly = true;

  public name = ['shadowclones', 'cast shadowclones'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return false;
  }

  mpCost() { return 300; }

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
