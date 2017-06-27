
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { TrueSight as CastEffect } from '../../../../../effects/TrueSight';

export class TrueSight extends Skill {

  public name = 'truesight';

  static macroMetadata = {
    name: 'TrueSight',
    macro: 'truesight',
    icon: 'all-seeing-eye',
    color: '#00a',
    mode: 'clickToTarget'
  };

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 25;
  range = () => 5;

  execute(user: Character, { gameState, args }) {
    const range = this.range();

    let target = user;

    if(args) {
      const possTargets = user.$$room.getPossibleMessageTargets(user, args);
      target = possTargets[0];
      if(!target) return user.sendClientMessage('You do not see that person.');

      if(target.distFrom(user) > range) return user.sendClientMessage('That target is too far away!');
    }

    const cost = this.mpCost();

    if(user.mp.getValue() < cost) return user.sendClientMessage('You do not have enough MP!');
    user.mp.sub(cost);

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const effect = new CastEffect({});
    effect.cast(user, target);
  }

}
