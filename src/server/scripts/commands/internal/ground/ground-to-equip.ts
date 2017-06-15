
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToEquip extends Command {

  public name = '~GtE';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, client, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 2) return false;

    const [itemType, itemId] = splitArgs;
    const ground = gameState.getGroundItems(player.x, player.y);
    if(!ground[itemType]) return room.sendClientLogMessage(client, 'You do not see that item.');

    const item = find(ground[itemType], { uuid: itemId });
    if(!item) return room.sendClientLogMessage(client, 'You do not see that item.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(!player.canEquip(item)) return room.sendClientLogMessage(client, 'You cannot equip that item.');

    player.equip(item);
    gameState.removeItemFromGround(item);
  }

}
