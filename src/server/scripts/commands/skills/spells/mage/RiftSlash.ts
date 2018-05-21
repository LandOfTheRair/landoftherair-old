


import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { CombatHelper } from '../../../../../helpers/world/combat-helper';
import { MoveHelper } from '../../../../../helpers/character/move-helper';
import { MessageHelper } from '../../../../../helpers/world/message-helper';
import { Player } from '../../../../../../shared/models/player';

export class RiftSlash extends Skill {

  static macroMetadata = {
    name: 'RiftSlash',
    macro: 'cast riftslash',
    icon: 'running-ninja',
    color: '#a0a',
    mode: 'lockActivation',
    tooltipDesc: 'Warp through the rift and physicall attack your enemy. Cost: 10 MP',
    requireCharacterLevel: 5,
    requireSkillLevel: 5,
    skillTPCost: 10
  };

  public name = ['riftslash', 'cast riftslash'];
  public format = 'Target';

  mpCost(user: Player) { return 10; }

  range(attacker: Character) {
    const weapon = attacker.rightHand;
    if(!weapon) return 5;

    if(weapon.twoHanded && attacker.leftHand) return -1;

    return 5;
  }

  execute(user: Player, { args }) {
    if(!args) return false;

    if(!this.tryToConsumeMP(user)) return;

    const range = this.range(user);
    if(range === -1) return user.sendClientMessage('You need to have your left hand empty to use that weapon!');

    const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.youDontSeeThatPerson(args);

    if(target === user) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {

    user.$$room.teleport(user, { x: target.x, y: target.y });
    user.$$room.updatePos(user);

    CombatHelper.physicalAttack(user, target, { attackRange: this.range(user) });
  }

}
