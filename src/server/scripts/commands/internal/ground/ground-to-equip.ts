
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToEquip extends Command {

  public name = '~GtE';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 2) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    const [itemType, itemId] = splitArgs;
    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return;

    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.equip(item);
    room.removeItemFromGround(item);
  }

}
