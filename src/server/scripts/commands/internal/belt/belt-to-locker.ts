
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToLocker extends Command {

  public name = '~BtK';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.belt[slot];
    if(!item) return false;

    if(!item.isLockerable) return room.sendClientLogMessage(client, 'That item is not lockerable.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(player.fullLocker()) return room.sendClientLogMessage(client, 'Your locker is full.');

    player.addItemToLocker(item);
    player.takeItemFromBelt(slot);
  }

}

