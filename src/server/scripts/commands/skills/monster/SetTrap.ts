
import { startsWith, find } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';

export class SetTrap extends Skill {

  name = '';
  execute() {}
  range = () => 0;

  canUse(user: Character, target: Character) {
    const trap = find(user.sack.allItems, { itemClass: 'Trap' });
    return !!trap;
  }

  use(user: Character, target: Character) {
    const trap = find(user.sack.allItems, { itemClass: 'Trap' });
    if(user.$$room.placeTrap(user.x, user.y, user, trap)) {
      user.sack.takeItem(trap);
    }
  }

}
