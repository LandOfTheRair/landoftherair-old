
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToMerchant extends Command {

  public name = '~BtM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, client, gameState, args }) {

    const [slot, merchantUUID] = args.split(' ');

    const container = room.state.findNPC(merchantUUID);
    if(!container) return room.sendClientLogMessage(client, 'That person is not here.');
    if(container.distFrom(player) > 2) return room.sendClientLogMessage(client, 'That person is too far away.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    const item = player.belt[+slot];
    if(!item) return false;

    player.sellItem(item);
    player.takeItemFromBelt(slot);
  }

}
