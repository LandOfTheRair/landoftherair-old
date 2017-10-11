
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToMerchant extends Command {

  public name = '~StM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, gameState, args }) {

    const [slot, merchantUUID] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    const container = room.state.findNPC(merchantUUID);
    if(!container) return player.sendClientMessage('That person is not here.');
    if(container.distFrom(player) > 2) return player.sendClientMessage('That person is too far away.');

    const item = player.sack.takeItemFromSlot(slot);
    if(!item) return false;
    if(!item.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    player.sellItem(item);
  }

}
