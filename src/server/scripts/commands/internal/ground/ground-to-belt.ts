
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToBelt extends Command {

  public name = '~GtB';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 2) return false;

    const [itemType, itemId] = splitArgs;
    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return;

    if(!player.addItemToBelt(item)) return;
    room.removeItemFromGround(item);
  }

}
