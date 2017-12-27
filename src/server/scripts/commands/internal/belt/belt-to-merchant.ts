
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToMerchant extends Command {

  public name = '~BtM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, gameState, args }) {

    const [slot, merchantUUID] = args.split(' ');

    if(this.isAccessingLocker(player)) return;
    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.checkMerchantDistance(player, merchantUUID)) return;

    const itemCheck = player.belt.getItemFromSlot(slot);
    if(!itemCheck.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    const item = player.belt.takeItemFromSlot(slot);
    if(!item) return false;

    player.sellItem(item);
  }

}
