
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';

export class Steal extends Skill {

  static macroMetadata = {
    name: 'Steal',
    macro: 'steal',
    icon: 'take-my-money',
    color: '#7F6B00',
    mode: 'lockActivation',
    tooltipDesc: 'Steal gold and items from your target.'
  };

  public name = 'steal';
  public format = 'Target';

  requiresLearn = false;

  range = () => 0;

  execute(user: Character, { gameState, args }) {
    if(!args) return false;

    if(!this.checkPlayerEmptyHand(user)) return;

    const possTargets = user.$$room.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    if(target.distFrom(user) > this.range()) return user.sendClientMessage('That target is too far away!');

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    this.facilitateSteal(user, target);
  }
}
