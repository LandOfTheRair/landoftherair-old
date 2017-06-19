
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class BuybackToRight extends Command {

  public name = '~OtR';
  public format = 'MerchantUUID ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {

    const [containerUUID, slot] = args.split(' ');

    const container = room.state.findNPC(containerUUID);
    if(!container) return room.sendClientLogMessage(client, 'That person is not here.');

    const item = player.buyback[+slot];
    if(!item) return room.sendClientLogMessage(client, 'You do not see that item.');

    if(player.gold < item._buybackValue) return room.sendClientLogMessage(client, 'You do not have enough gold for that.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    player.buyItemBack(slot);
    player.loseGold(item._buybackValue);

    const newItem = new Item(item);

    if(player.rightHand && !player.leftHand) {
      player.setLeftHand(player.rightHand);
    }

    player.setRightHand(newItem);
  }

}
