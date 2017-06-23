
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class BuybackToLeft extends Command {

  public name = '~OtL';
  public format = 'MerchantUUID ItemSlot';

  execute(player: Player, { room, gameState, args }) {

    const [containerUUID, slot] = args.split(' ');

    const container = room.state.findNPC(containerUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.buyback[+slot];
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(player.gold < item._buybackValue) return player.sendClientMessage('You do not have enough gold for that.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    player.buyItemBack(slot);
    player.loseGold(item._buybackValue);

    const newItem = new Item(item);

    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    player.setLeftHand(newItem);
  }

}
