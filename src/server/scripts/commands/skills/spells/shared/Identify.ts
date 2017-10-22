
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { MagicMissile as CastEffect } from '../../../../../effects/MagicMissile';

export class Identify extends Skill {

  static macroMetadata = {
    name: 'Identify',
    macro: 'cast identify',
    icon: 'uncertainty',
    color: '#665600',
    mode: 'autoActivate',
    tooltipDesc: 'Identify the attributes of the item in your right hand. Cost: 15 MP'
  };

  public name = ['identify', 'cast identify'];

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 15;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!user.rightHand) return user.sendClientMessage('You need to have something in your right hand to identify it.');

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, effect);
  }

  use(user: Character, baseEffect = { potency: 0 }) {
    const potency = 1 + Math.floor(baseEffect.potency || user.calcSkillLevel(SkillClassNames.Conjuration) / 10);
    user.sendClientMessage(user.rightHand.descTextFor(user, potency));
  }

}
