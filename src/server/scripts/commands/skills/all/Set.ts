
import { Skill } from '../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../shared/models/character';
import { TrapHelper } from '../../../../helpers/trap-helper';

export class Set extends Skill {

  public name = 'set';

  requiresLearn = false;

  range = (attacker: Character) => 0;

  execute(user: Character, { gameState, args }) {

    if(user.baseClass !== 'Thief') return user.sendClientMessage('Only Thieves can set traps!');

    const weapon = user.rightHand;
    if(!weapon || weapon.itemClass !== 'Trap') return user.sendClientMessage('You need a trap in your right hand to set it!');

    let xSet = 0;
    let ySet = 0;

    if(args) {
      const { x, y } = user.getXYFromDir(args);
      xSet = x;
      ySet = y;
    }

    const targetX = user.x + xSet;
    const targetY = user.y + ySet;

    const interactable = user.$$room.state.getInteractable(targetX, targetY, true, 'Trap');
    if(interactable) return user.sendClientMessage('There is already a trap there!');

    this.use(user, { x: targetX, y: targetY });
  }

  use(user: Character, { x, y } = { x: 0, y: 0 }) {
    const trap = user.rightHand;
    user.setRightHand(null);

    user.gainSkill(SkillClassNames.Thievery, 3);
    TrapHelper.placeTrap(x, y, user, trap);
    user.sendClientMessage(`You set the ${trap.effect.name} trap.`);
  }

}
