
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class MerchantToLeft extends Command {

  public name = '~MtL';
  public format = 'MerchantUUID ItemUUID';

  execute(player: Player, { room, gameState, args }) {

    const [containerUUID, itemUUID] = args.split(' ');

    const container = room.state.findNPC(containerUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = find(container.vendorItems, { uuid: itemUUID });
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(player.gold < item.value) return player.sendClientMessage('You do not have enough gold for that.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    player.loseGold(item.value);

    const newItem = new Item(item);
    newItem.regenerateUUID();

    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    player.setLeftHand(newItem);
  }

}
