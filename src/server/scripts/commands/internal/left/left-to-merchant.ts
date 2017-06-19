
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToMerchant extends Command {

  public name = '~LtM';
  public format = 'MerchantUUID';

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.leftHand;

    const container = room.state.findNPC(args);
    if(!container) return room.sendClientLogMessage(client, 'That person is not here.');

    if(container.distFrom(player) > 2) return room.sendClientLogMessage(client, 'That person is too far away.');

    player.sellItem(item);
    player.setLeftHand(null);
  }

}
