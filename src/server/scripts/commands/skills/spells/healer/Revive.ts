
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Revive as CastEffect } from '../../../../../effects/cures/Revive';

export class Revive extends Skill {

  static macroMetadata = {
    name: 'Revive',
    macro: 'cast revive',
    icon: 'quicksand',
    color: '#080',
    mode: 'autoActivate',
    tooltipDesc: 'Revive a single player on your tile. Cost: 50 MP'
  };

  public name = ['revive', 'cast revive'];
  public format = '';

  mpCost() { return 50; }

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    const targets = user.$$room.state.getPlayersInRange(user, 0, [user.uuid]).filter(target => target.isDead());
    const target = targets[0];

    if(!target) return user.sendClientMessage('There is no one in need of revival here!');

    user.sendClientMessage(`You are reviving ${target.name}.`);
    target.sendClientMessage(`You have been revived by ${user.name}.`);

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
