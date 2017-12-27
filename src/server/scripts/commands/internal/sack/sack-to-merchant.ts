
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class SackToMerchant extends Command {

  public name = '~StM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;

    const [slot, merchantUUID] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    const container = room.state.findNPC(merchantUUID);
    if(!container) return player.sendClientMessage('That person is not here.');
    if(container.distFrom(player) > 2) return player.sendClientMessage('That person is too far away.');

    const itemCheck = player.sack.getItemFromSlot(+slot);
    if(!itemCheck) return false;
    if(!itemCheck.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    const item = player.sack.takeItemFromSlot(+slot);
    if(!item) return false;

    player.sellItem(item);
  }

}
