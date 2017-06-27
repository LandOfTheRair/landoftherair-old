
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class Throw extends Skill {

  public name = 'throw';
  public format = 'Hand Target';

  requiresLearn = false;

  static macroMetadata = {
    name: 'Throw',
    macro: 'throw right',
    icon: 'thrown-spear',
    color: '#530000',
    mode: 'lockActivation'
  };

  range = (attacker: Character) => {
    return 4;
  };

  execute(user: Character, { gameState, args }) {
    if(!args) return false;

    let [hand, targetId] = args.split(' ');
    if(!targetId) return false;

    const possTargets = user.$$room.getPossibleMessageTargets(user, targetId);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    hand = hand.toLowerCase();
    if(hand !== 'left' && hand !== 'right') return false;
    if(!user[`${hand}Hand`]) return user.sendClientMessage('You do not have anything to throw in that hand!');

    this.use(user, target, { throwHand: hand });
  }

  use(user: Character, target: Character, opts: any = {}) {
    let { throwHand } = opts;
    CombatHelper.physicalAttack(user, target, { isThrow: true, throwHand });
  }

}
