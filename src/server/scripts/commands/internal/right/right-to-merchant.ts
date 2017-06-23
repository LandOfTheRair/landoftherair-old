
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToMerchant extends Command {

  public name = '~RtM';
  public format = 'MerchantUUID';

  execute(player: Player, { room, gameState, args }) {
    const item = player.rightHand;

    if(!item) return false;

    const container = room.state.findNPC(args);
    if(!container) return player.sendClientMessage('That person is not here.');

    if(container.distFrom(player) > 2) return player.sendClientMessage('That person is too far away.');

    player.sellItem(item);
    player.setRightHand(null);
  }

}
