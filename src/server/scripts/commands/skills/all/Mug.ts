
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';
import { MoveHelper } from '../../../../helpers/move-helper';

export class Mug extends Skill {

  static macroMetadata = {
    name: 'Mug',
    macro: 'mug',
    icon: 'hooded-assassin',
    color: '#530000',
    mode: 'lockActivation'
  };

  public name = 'mug';
  public format = 'Target';

  requiresLearn = false;

  range = (attacker: Character) => {
    const weapon = attacker.rightHand;
    if(!weapon) return 0;

    if(weapon.twoHanded && attacker.leftHand) return -1;

    return weapon.attackRange + attacker.getTotalStat('move');
  }

  execute(user: Character, { gameState, args }) {
    if(!args) return false;

    const weapon = user.rightHand;
    if(!weapon) return user.sendClientMessage('You need a weapon in your hand to mug!');

    if(!this.checkPlayerEmptyHand(user)) return;

    const thiefSkill = user.calcSkillLevel(SkillClassNames.Thievery);
    if(thiefSkill < 7) return user.sendClientMessage('You are not skilled enough to do that!');

    const range = this.range(user);
    if(range === -1) return user.sendClientMessage('You need to have your left hand empty to use that weapon!');

    const possTargets = user.$$room.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    if(target.distFrom(user) > range) return user.sendClientMessage('That target is too far away!');

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const xDiff = target.x - user.x;
    const yDiff = target.y - user.y;

    MoveHelper.move(user, { room: user.$$room, gameState: user.$$room.state, x: xDiff, y: yDiff });

    const res = CombatHelper.physicalAttack(user, target, { isMug: true, attackRange: this.range(user) });

    if((<any>res).hit) {
      this.facilitateSteal(user, target);
    }
  }

}
