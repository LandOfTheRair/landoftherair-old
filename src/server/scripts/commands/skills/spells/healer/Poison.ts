
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { Poison as CastEffect } from '../../../../../effects/Poison';

export class Poison extends Skill {

  public name = 'poison';
  public format = 'Target';

  static macroMetadata = {
    name: 'Poison',
    macro: 'poison',
    icon: 'poison-gas',
    color: '#0a0',
    mode: 'clickToTarget'
  };

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 15;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {
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
