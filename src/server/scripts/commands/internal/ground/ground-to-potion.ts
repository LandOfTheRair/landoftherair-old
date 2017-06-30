
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToPotion extends Command {

  public name = '~GtP';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 2) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    const [itemType, itemId] = splitArgs;
    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return;

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    player.setPotionHand(item);
    room.removeItemFromGround(item);
  }

}
