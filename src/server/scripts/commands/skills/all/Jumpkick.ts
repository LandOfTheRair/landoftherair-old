


import { Skill } from '../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/world/combat-helper';
import { MoveHelper } from '../../../../helpers/character/move-helper';
import { MessageHelper } from '../../../../helpers/world/message-helper';
import { Player } from '../../../../../shared/models/player';

export class Jumpkick extends Skill {

  static macroMetadata = {
    name: 'Jumpkick',
    macro: 'jumpkick',
    icon: 'high-kick',
    color: '#530000',
    mode: 'lockActivation',
    tooltipDesc: 'Jump and kick an enemy. Requires Martial skill 5.'
  };

  public name = 'jumpkick';
  public format = 'Target';

  requiresLearn = false;

  canUse(user: Character, target: Character) {
    const dist = user.distFrom(target);
    return dist > 0 && this.range(user) >= dist;
  }

  range(attacker: Character) {
    return attacker.getTotalStat('move');
  }

  execute(user: Player, { args }) {
    if(!args) return false;

    const userSkill = user.calcSkillLevel(SkillClassNames.Martial);
    if(userSkill < 5) return user.sendClientMessage('You are not skilled enough to do that!');

    const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.youDontSeeThatPerson(args);

    if(target === user) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const xDiff = target.x - user.x;
    const yDiff = target.y - user.y;

    if(user.baseClass === 'Warrior') user.gainSkill(SkillClassNames.Martial, 1);

    MoveHelper.move(user, { room: user.$$room, gameState: user.$$room.state, x: xDiff, y: yDiff }, true);

    user.$$room.updatePos(user);

    CombatHelper.physicalAttack(user, target, { attackRange: 0, isKick: true });

    const bonusPunches = user.getTraitLevel('Punchkick');
    for(let i = 0; i < bonusPunches; i++) {
      CombatHelper.physicalAttack(user, target, { attackRange: 0, isPunch: true });
    }
  }

}
