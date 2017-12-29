
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PotionToMerchant extends Command {

  public name = '~PtM';
  public format = 'MerchantUUID';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;

    const merchantUUID = args;



    const container = room.state.findNPC(merchantUUID);
    if(!container) return player.sendClientMessage('That person is not here.');
    if(container.distFrom(player) > 2) return player.sendClientMessage('That person is too far away.');

    const item = player.potionHand;
    if(!item) return false;
    if(!item.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    player.setPotionHand(null);
    player.sellItem(item);
  }

}
