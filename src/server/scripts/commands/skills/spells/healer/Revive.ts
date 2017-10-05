
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { Revive as CastEffect } from '../../../../../effects/Revive';

export class Revive extends Skill {

  public name = 'revive';
  public format = '';

  static macroMetadata = {
    name: 'Revive',
    macro: 'revive',
    icon: 'quicksand',
    color: '#080',
    mode: 'autoActivate'
  };

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 50;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    const targets = user.$$room.state.getPlayersInRange(user, 0, [user.uuid]).filter(target => target.dir === 'C');
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
