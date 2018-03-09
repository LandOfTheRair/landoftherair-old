
import { find } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { TrapHelper } from '../../../../helpers/world/trap-helper';

export class SetTrap extends Skill {

  name = 'settrap';
  execute() {}

  canUse(user: Character, target: Character) {
    const trap = find(user.sack.allItems, { itemClass: 'Trap' });
    return !!trap;
  }

  use(user: Character, target: Character) {
    const trap = find(user.sack.allItems, { itemClass: 'Trap' });
    if(TrapHelper.placeTrap(user.x, user.y, user, trap)) {
      user.sack.takeItem(trap);
    }
  }

}
