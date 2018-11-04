
import { includes } from 'lodash';

import { Skill } from '../../../base/Skill';
import { Character } from '../../../../shared/models/character';

export class Empty extends Skill {

  public name = 'empty';
  public format = 'Hand';

  requiresLearn = false;

  execute(user: Character, { args }) {
    if(!args) args = 'right';
    const [handCheck] = args.split(' ');

    const hand = handCheck.toLowerCase();
    if(hand !== 'left' && hand !== 'right') return false;

    const item = user[`${hand}Hand`];
    if(!item || item.itemClass !== 'Bottle') return user.sendClientMessage('You do not have anything to empty in that hand!');

    if(!item.isOwnedBy(user)) return user.sendClientMessage('That is not yours!');

    if(item.ounces <= 0) return user.sendClientMessage('You can\'t empty that bottle!');

    this.use(user, user, { hand });
  }

  use(user: Character, target: Character, opts: any = {}) {
    const { hand } = opts;

    const item = user[`${hand}Hand`];
    item.ounces = 0;
    item.value = 1;
    item.effect = null;
    item.extendedDesc = '';

    if(includes(item.name, '(Filled')) item.name = item.name.substring(0, item.name.indexOf('(Filled') - 1);
    item.name = `${item.name} (Empty)`;
    user.sendClientMessage(`You empty the bottle in your ${hand} hand.`);
  }

}
