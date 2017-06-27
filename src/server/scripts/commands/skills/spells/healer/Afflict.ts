
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { Afflict as CastEffect } from '../../../../../effects/Afflict';

export class Afflict extends Skill {

  public name = 'afflict';
  public format = 'Target';

  static macroMetadata = {
    name: 'Afflict',
    macro: 'afflict',
    icon: 'bolas',
    color: '#bd5900',
    mode: 'lockActivation'
  };

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 10;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {
    if(!args) return false;

    const range = this.range();

    const possTargets = user.$$room.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    if(target.distFrom(user) > range) return user.sendClientMessage('That target is too far away!');

    const cost = this.mpCost();

    if(!effect && user.mp.getValue() < cost) return user.sendClientMessage('You do not have enough MP!');
    user.mp.sub(cost);

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
