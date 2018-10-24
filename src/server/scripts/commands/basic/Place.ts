
import { includes } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Place extends Command {

  public name = 'place';
  public format = 'ItemType|ItemName [in sack|belt|pouch]';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;

    if(includes(args, ' in')) args = args.split(' in').join('');

    let [itemTypeOrName, container] = args.split(' ');

    itemTypeOrName = itemTypeOrName.toLowerCase();
    container = (container || 'sack').toLowerCase();

    if(!includes(['belt', 'sack', 'pouch'], container)) return player.sendClientMessage('Invalid container.');

    let item = null;
    let hand = null;

    if(player.rightHand
    && (player.rightHand.itemClass.toLowerCase() === itemTypeOrName
    || includes(player.rightHand.name.toLowerCase(), itemTypeOrName))) { hand = 'right'; item = player.rightHand; }

    if(player.leftHand
    && (player.leftHand.itemClass.toLowerCase() === itemTypeOrName
    || includes(player.leftHand.name.toLowerCase(), itemTypeOrName))) { hand = 'left'; item = player.leftHand; }

    if(!item) return;

    if(container === 'sack' && !player.addItemToSack(item)) return;
    if(container === 'belt' && !player.addItemToBelt(item)) return;
    if(container === 'pouch' && !player.addItemToPouch(item)) return;

    if(hand === 'right') player.setRightHand(null);
    if(hand === 'left') player.setLeftHand(null);
  }

}
