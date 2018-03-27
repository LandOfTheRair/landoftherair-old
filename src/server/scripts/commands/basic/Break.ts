
import { capitalize } from 'lodash';

import { Skill } from '../../../base/Skill';
import { Character } from '../../../../shared/models/character';

export class Break extends Skill {

  public name = 'break';
  public format = 'Hand';

  requiresLearn = false;

  range(attacker: Character) {
    return 5;
  }

  execute(user: Character, { args }) {

    if(!args) return false;

    const [handCheck] = args.split(' ');

    const hand = handCheck.toLowerCase();
    if(hand !== 'left' && hand !== 'right') return false;
    const item = user[`${hand}Hand`];
    if(!item) return user.sendClientMessage('You do not have anything to break in that hand!');

    if(!item.isOwnedBy(user)) return user.sendClientMessage('That is not yours!');

    this.use(user, user, { hand });
  }

  use(user: Character, target: Character, opts: any = {}) {
    const { hand } = opts;

    user[`set${capitalize(hand)}Hand`](null);
    user.sendClientMessage(`You break the item in your ${hand} hand.`);
  }

}
