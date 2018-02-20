
import { Skill } from '../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../shared/models/character';

export class Disarm extends Skill {

  public name = 'disarm';
  public format = 'Dir';

  requiresLearn = false;

  range = (attacker: Character) => 0;

  execute(user: Character, { gameState, args }) {

    if(user.baseClass !== 'Thief') return user.sendClientMessage('Only Thieves can disarm traps!');

    const { x, y } = user.getXYFromDir(args);

    if(x === 0 && y === 0) return user.sendClientMessage('You can\'t disarm a trap from there!');

    const targetX = user.x + x;
    const targetY = user.y + y;

    const interactable = user.$$room.state.getInteractable(targetX, targetY, true, 'Trap');
    if(!interactable) return user.sendClientMessage('There is no trap there!');

    this.use(user, { x: targetX, y: targetY });
  }

  use(user: Character, { x, y } = { x: 0, y: 0 }) {
    const trap = user.$$room.state.getInteractable(x, y, true, 'Trap');
    if(!trap) return user.sendClientMessage('There is no trap there!');

    const { setSkill, caster } = trap.properties;
    const mySkill = user.calcSkillLevel(SkillClassNames.Thievery);

    if(caster.username !== (<any>user).username) {
      if(mySkill <= setSkill) return user.sendClientMessage('You are unable to disarm the trap.');
      user.gainSkill(SkillClassNames.Thievery, 3);
    }

    user.$$room.state.removeInteractable(trap);
    user.sendClientMessage(`You disarmed the trap.`);
  }

}
