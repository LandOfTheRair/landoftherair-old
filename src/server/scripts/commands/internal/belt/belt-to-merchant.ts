
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToMerchant extends Command {

  public name = '~BtM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, gameState, args }) {

    const [slot, merchantUUID] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return false;

    if(!this.checkMerchantDistance(player, merchantUUID)) return false;

    const item = player.belt.takeItemFromSlot(slot);
    if(!item) return false;

    player.sellItem(item);
  }

}
