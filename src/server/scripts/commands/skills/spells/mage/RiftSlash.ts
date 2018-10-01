


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { CombatHelper } from '../../../../../helpers/world/combat-helper';
import { MessageHelper } from '../../../../../helpers/world/message-helper';
import { Player } from '../../../../../../shared/models/player';
import { RollerHelper } from '../../../../../../shared/helpers/roller-helper';
import { Drain } from '../../../../../effects';

export class RiftSlash extends Skill {

  static macroMetadata = {
    name: 'RiftSlash',
    macro: 'cast riftslash',
    icon: 'running-ninja',
    color: '#a0a',
    mode: 'lockActivation',
    tooltipDesc: 'Warp through the rift and physically attack your enemy. Cost: 10 MP',
    requireCharacterLevel: 5,
    requireSkillLevel: 5,
    skillTPCost: 10
  };

  public name = ['riftslash', 'cast riftslash'];
  public format = 'Target';

  mpCost(user: Player) { return 10; }

  range(attacker: Character) {
    return this.calcPlainAttackRange(attacker, 5);
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

    const drainChance = user.getTraitLevelAndUsageModifier('DrainSlash');
    if(RollerHelper.XInOneHundred(drainChance)) {
      const drain = new Drain({});
      drain.shouldNotShowMessage = true;
      drain.cast(user, target, this);
      drain.shouldNotShowMessage = false;
    }
  }

}
