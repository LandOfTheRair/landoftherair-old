
import { includes } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Take extends Command {

  public name = 'take';
  public format = 'ItemType|ItemName [from sack|belt|pouch]';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(includes(args, ' from')) args = args.split(' from').join('');

    let [itemTypeOrName, container] = args.split(' ');

    itemTypeOrName = itemTypeOrName.toLowerCase();
    container = (container || 'sack').toLowerCase();

    if(!includes(['belt', 'sack', 'pouch'], container)) return player.sendClientMessage('Invalid container.');

    const containerItems = player[container].allItems;
    let takeItemSlot = -1;

    containerItems.forEach((checkItem, i) => {
      if(takeItemSlot >= 0) return;

      if(checkItem.itemClass.toLowerCase() === itemTypeOrName) takeItemSlot = i;
      if(includes(checkItem.name.toLowerCase(), itemTypeOrName)) takeItemSlot = i;
    });

    if(takeItemSlot === -1) return player.sendClientMessage('Item was not found.');

    const item = player[container].takeItemFromSlot(takeItemSlot);
    if(!item) return;

    if(!player.rightHand) player.setRightHand(item);
    else if(!player.leftHand) player.setLeftHand(item);

  }

}
