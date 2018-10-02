


import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { CombatHelper } from '../../../../../helpers/world/combat-helper';
import { MoveHelper } from '../../../../../helpers/character/move-helper';
import { MessageHelper } from '../../../../../helpers/world/message-helper';
import { Player } from '../../../../../../shared/models/player';

export class Thruststrike extends Skill {

  static macroMetadata = {
    name: 'Thruststrike',
    macro: 'art thruststrike',
    icon: 'saber-slash',
    color: '#a00',
    mode: 'lockActivation',
    tooltipDesc: 'Charge towards an enemy, attacking with the item in your right hand. Deals more damage than Charge.',
    requireSkillLevel: 7
  };

  public name = ['thruststrike', 'art thruststrike'];
  public format = 'Target';
  public unableToLearnFromStealing = true;

  canUse(user: Character, target: Character) {
    return this.range(user) + user.getTotalStat('move') >= user.distFrom(target);
  }

  range(attacker: Character) {
    return this.calcPlainAttackRange(attacker);
  }

  execute(user: Player, { args }) {
    if(!args) return false;

    const weapon = user.rightHand;
    if(!weapon) return user.sendClientMessage('You need a weapon in your hand to thrust!');

    const range = this.range(user);
    if(range === -1) return user.sendClientMessage('You need to have your left hand empty to use that weapon!');

    const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.youDontSeeThatPerson(args);

    if(target === user) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const xDiff = target.x - user.x;
    const yDiff = target.y - user.y;

    /** PERK:CLASS:WARRIOR:Warriors gain skill on physical hits. */
    if(user.baseClass === 'Warrior') user.gainSkill(user.rightHand ? user.rightHand.itemClass : SkillClassNames.Martial, 1);

    MoveHelper.move(user, { room: user.$$room, gameState: user.$$room.state, x: xDiff, y: yDiff }, true);

    user.$$room.updatePos(user);

    CombatHelper.physicalAttack(user, target, { attackRange: this.range(user), damageMult: 1.25 });

    if(user.getTraitLevel('DoubleThrust')) {
      CombatHelper.physicalAttack(user, target, { attackRange: this.range(user) });
    }
  }

}
