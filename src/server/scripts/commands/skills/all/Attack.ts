
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';
import { MessageHelper } from '../../../../helpers/message-helper';

export class Attack extends Skill {

  static macroMetadata = {
    name: 'Attack',
    macro: 'attack',
    icon: 'blade-drag',
    color: '#530000',
    mode: 'lockActivation',
    tooltipDesc: 'Physically attack a target with the item in your right hand.'
  };

  public name = 'attack';
  public format = 'Target';

  requiresLearn = false;

  range = (attacker: Character) => {
    const weapon = attacker.rightHand;
    if(!weapon) return 0;

    if(weapon.twoHanded && attacker.leftHand) return -1;

    return weapon.attackRange;
  }

  execute(user: Character, { gameState, args }) {
    if(!args) return false;

    const range = this.range(user);
    if(range === -1) return user.sendClientMessage('You need to have your left hand empty to use that weapon!');

    const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    if(target === user) return;

    if(target.distFrom(user) > range) return user.sendClientMessage('That target is too far away!');

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    if(user.baseClass === 'Warrior') user.gainSkill(user.rightHand ? user.rightHand.itemClass : 'Martial', 1);
    CombatHelper.physicalAttack(user, target, { attackRange: this.range(user) });
  }

}
