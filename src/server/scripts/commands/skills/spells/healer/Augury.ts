
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Augury as CastEffect } from '../../../../../effects/misc/Augury';
import { MessageHelper } from '../../../../../helpers/message-helper';

export class Augury extends Skill {

  static macroMetadata = {
    name: 'Augury',
    macro: 'cast augury',
    icon: 'dove',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'Use the winds to divine the location of your target. Cost: 25 MP'
  };

  public name = ['augury', 'cast augury'];
  public format = '';

  mpCost = () => 25;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    const possTargets = MessageHelper.getPossibleAuguryTargets(user, args);
    if(!possTargets.length) return user.sendClientMessage('The birds fly around, confused at your query.');

    const target = possTargets[0];
    if(!target) return false;

    this.use(user, target, effect);
  }

  async use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect({});
    effect.cast(user, target);
  }

}
