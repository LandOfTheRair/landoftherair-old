
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToBelt extends Command {

  public name = '~GtB';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, client, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 2) return false;

    const [itemType, itemId] = splitArgs;
    const ground = gameState.getGroundItems(player.x, player.y);
    if(!ground[itemType]) return room.sendClientLogMessage(client, 'You do not see that item.');

    const item = find(ground[itemType], { uuid: itemId });
    if(!item) return room.sendClientLogMessage(client, 'You do not see that item.');

    if(!item.isBeltable) return room.sendClientLogMessage(client, 'That item is not beltable.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(player.fullBelt()) return room.sendClientLogMessage(client, 'Your belt is full.');

    player.addItemToBelt(item);
    room.removeItemFromGround(item);
  }

}
