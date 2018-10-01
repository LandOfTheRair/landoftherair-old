
import { MonsterSkill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ZombieScratch } from '../../../../../effects/holiday/ZombieScratch';

export class HalloweenZombieScratch extends MonsterSkill {

  name = 'halloweenzombiescratch';

  canUse(user: Character, target: Character) {
    return !target.hasEffect('Dangerous')
        && !target.hasEffect('ZombieScratch')
        && target.monsterClass === 'Humanoid'
        && !target.isPlayer()
        && user.distFrom(target) <= this.range();
  }

  use(user: Character, target: Character) {
    target.sendClientMessageToRadius({ name: target.name, message: `Aaaah! Help me! I've been scratched!`, subClass: 'chatter' }, 8);

    const scratch = new ZombieScratch({});
    scratch.cast(user, target);
  }

}
