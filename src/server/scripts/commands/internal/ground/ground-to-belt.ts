
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
    const ground = gameState.getGroundItems(player.x, player.y);
    if(!ground[itemType]) return player.sendClientMessage('You do not see that item.');

    const item = find(ground[itemType], { uuid: itemId });
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(!item.isBeltable) return player.sendClientMessage('That item is not beltable.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(player.fullBelt()) return player.sendClientMessage('Your belt is full.');

    player.addItemToBelt(item);
    room.removeItemFromGround(item);
  }

}
