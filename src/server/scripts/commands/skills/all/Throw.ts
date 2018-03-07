
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';
import { MessageHelper } from '../../../../helpers/message-helper';

export class Throw extends Skill {

  static macroMetadata = {
    name: 'Throw',
    macro: 'throw right',
    icon: 'thrown-spear',
    color: '#530000',
    mode: 'lockActivation',
    tooltipDesc: 'Throw an item at a target.'
  };

  public name = 'throw';
  public format = 'Hand Target';

  requiresLearn = false;

  range(attacker: Character) {
    return 5;
  }

  execute(user: Character, { gameState, args }) {

    if(!args) return false;

    const [handCheck, targetId] = args.split(' ');
    if(!targetId) return false;

    const possTargets = MessageHelper.getPossibleMessageTargets(user, targetId);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    if(target === user) return;

    if(target.distFrom(user) > this.range(user)) return user.sendClientMessage('That target is too far away!');

    const hand = handCheck.toLowerCase();
    if(hand !== 'left' && hand !== 'right') return false;
    if(!user[`${hand}Hand`]) return user.sendClientMessage('You do not have anything to throw in that hand!');

    this.use(user, target, { throwHand: hand });
  }

  use(user: Character, target: Character, opts: any = {}) {
    const { throwHand } = opts;
    CombatHelper.physicalAttack(user, target, { isThrow: true, throwHand, attackRange: this.range(user) });
  }

}
