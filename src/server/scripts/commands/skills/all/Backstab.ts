
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';
import { MoveHelper } from '../../../../helpers/move-helper';
import { MessageHelper } from '../../../../helpers/message-helper';

export class Backstab extends Skill {

  static macroMetadata = {
    name: 'Backstab',
    macro: 'backstab',
    icon: 'backstab',
    color: '#530000',
    mode: 'lockActivation',
    tooltipDesc: 'Backstab your target from the shadows. Requires Thievery skill 3.'
  };

  public name = 'backstab';

  requiresLearn = false;

  range = (attacker: Character) => {
    const weapon = attacker.rightHand;
    if(!weapon) return 0;

    if(weapon.twoHanded && attacker.leftHand) return -1;

    return weapon.attackRange;
  }

  execute(user: Character, { gameState, args }) {
    if(!args) return false;

    const hidden = user.hasEffect('Hidden');
    if(!hidden) return user.sendClientMessage('You are not hidden!');

    const weapon = user.rightHand;
    if(!weapon) return user.sendClientMessage('You need a weapon in your hand to backstab!');

    const userSkill = user.calcSkillLevel(SkillClassNames.Thievery);
    if(userSkill < 3) return user.sendClientMessage('You are not skilled enough to do that!');

    const range = this.range(user);
    if(range === -1) return user.sendClientMessage('You need to have your left hand empty to use that weapon!');

    const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    if(target.canSeeThroughStealthOf(user)) return user.sendClientMessage('You do not have the element of surprise!');

    user.unapplyEffect(hidden, true);
    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const xDiff = target.x - user.x;
    const yDiff = target.y - user.y;

    MoveHelper.move(user, { room: user.$$room, gameState: user.$$room.state, x: xDiff, y: yDiff }, true);
    user.$$room.updatePos(user);

    CombatHelper.physicalAttack(user, target, { isBackstab: true, attackRange: this.range(user) });
  }

}
