


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { CombatHelper } from '../../../../../helpers/world/combat-helper';
import { MessageHelper } from '../../../../../helpers/world/message-helper';
import { Player } from '../../../../../../shared/models/player';
import { RollerHelper } from '../../../../../../shared/helpers/roller-helper';
import { Drain } from '../../../../../effects';

export class MultiShot extends Skill {

  static macroMetadata = {
    name: 'MultiShot',
    macro: 'cast multishot',
    icon: 'double-shot',
    color: '#000',
    mode: 'lockActivation',
    tooltipDesc: 'Shoot multiple arrows at your enemy. Cost: 10 HP',
    skillTPCost: 10
  };

  public name = ['multishot', 'cast multishot'];
  public format = 'Target';

  mpCost(user: Player) { return 10; }

  canUse(user: Player) {
    return !!(user.rightHand && user.leftHand && user.rightHand.canShoot && user.leftHand.shots);
  }

  range(attacker: Character) {
    return this.calcPlainAttackRange(attacker, 5);
  }

  execute(user: Player, { args }) {
    if(!args) return false;

    if(!this.canUse(user)) return user.sendClientMessage('You need to be holding a weapon capable of shooting, and ammo!');

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

    let attacks = 2;
    let mult = 0.80;

    if(user.getTraitLevel('TripleShot')) {
      attacks++;
      mult = 0.70;
    }

    for(let i = 0; i < attacks; i++) {
      CombatHelper.physicalAttack(user, target, { attackRange: this.range(user), damageMult: mult });
    }
  }

}
