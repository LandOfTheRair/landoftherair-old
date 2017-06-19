
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class MerchantToRight extends Command {

  public name = '~MtR';
  public format = 'MerchantUUID ItemUUID';

  execute(player: Player, { room, client, gameState, args }) {

    const [containerUUID, itemUUID] = args.split(' ');

    const container = room.state.findNPC(containerUUID);
    if(!container) return room.sendClientLogMessage(client, 'That person is not here.');

    const item = find(container.vendorItems, { uuid: itemUUID });
    if(!item) return room.sendClientLogMessage(client, 'You do not see that item.');

    if(player.gold < item.value) return room.sendClientLogMessage(client, 'You do not have enough gold for that.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    player.loseGold(item.value);

    const newItem = new Item(item);
    newItem.regenerateUUID();

    if(player.rightHand && !player.leftHand) {
      player.setLeftHand(player.rightHand);
    }

    player.setRightHand(newItem);
  }

}
