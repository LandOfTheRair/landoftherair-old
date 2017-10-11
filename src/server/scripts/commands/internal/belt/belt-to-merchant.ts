
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToMerchant extends Command {

  public name = '~BtM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, gameState, args }) {

    const [slot, merchantUUID] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.checkMerchantDistance(player, merchantUUID)) return;

    const item = player.belt.takeItemFromSlot(slot);
    if(!item) return false;
    if(!item.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    player.sellItem(item);
  }

}
