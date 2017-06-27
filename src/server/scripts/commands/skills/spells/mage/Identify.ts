
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { MagicMissile as CastEffect } from '../../../../../effects/MagicMissile';

export class Identify extends Skill {

  public name = 'identify';

  static macroMetadata = {
    name: 'Identify',
    macro: 'identify',
    icon: 'uncertainty',
    color: '#665600',
    mode: 'autoActivate'
  };

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 15;
  range = () => 0;

  execute(user: Character, { gameState, args }) {
    if(!user.rightHand) return user.sendClientMessage('You need to have something in your right hand to identify it.');

    const cost = this.mpCost();

    if(user.mp.getValue() < cost) return user.sendClientMessage('You do not have enough MP!');
    user.mp.sub(cost);

    this.use(user);
  }

  use(user: Character) {
    const potency = 1 + Math.floor(user.calcSkillLevel(SkillClassNames.Conjuration) / 10);
    user.sendClientMessage(user.rightHand.descTextFor(user, potency));
  }

}
