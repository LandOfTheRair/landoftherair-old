
import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { TrapHelper } from '../../../../../helpers/world/trap-helper';

export class Set extends Skill {

  static macroMetadata = {
    name: 'Set',
    macro: 'cast set',
    icon: 'quake-stomp',
    color: '#530000',
    mode: 'clickToActivate',
    tooltipDesc: 'Set a trap from your hand. Traps can be purchased from thief vendors. Allows directional targeting.'
  };

  public name = ['set', 'cast set'];
  public format = 'Dir';

  range(user: Character) {
    return 1 + user.getTraitLevelAndUsageModifier('ThrownTraps');
  }

  execute(user: Character, { args }) {

    const weapon = user.rightHand;
    if(!weapon || weapon.itemClass !== 'Trap') return user.sendClientMessage('You need a trap in your right hand to set it!');

    const target = this.getTarget(user, args, true, true);
    if(!target) return;

    const targetX = target.x;
    const targetY = target.y;

    const interactable = user.$$room.state.getInteractable(targetX, targetY, true, 'Trap');
    if(interactable) return user.sendClientMessage('There is already a trap there!');

    this.use(user, { x: targetX, y: targetY });
  }

  use(user: Character, { x, y } = { x: 0, y: 0 }) {
    const trap = user.rightHand;

    if(!TrapHelper.placeTrap(x, y, user, trap)) return user.sendClientMessage('You cannot set a trap there.');

    trap.trapUses--;
    if(trap.trapUses <= 0) user.setRightHand(null);

    user.gainSkill(SkillClassNames.Thievery, 3);
    user.sendClientMessage(`You set the ${trap.effect.name} trap.`);
  }

}
