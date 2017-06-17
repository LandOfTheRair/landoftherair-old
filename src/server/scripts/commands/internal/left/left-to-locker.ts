
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToLocker extends Command {

  public name = '~LtK';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.leftHand;

    if(!item.isLockerable) return room.sendClientLogMessage(client, 'That item is not lockerable.');

    if(player.fullLocker()) return room.sendClientLogMessage(client, 'Your locker is full.');

    player.addItemToLocker(item);
    player.setLeftHand(null);
  }

}

