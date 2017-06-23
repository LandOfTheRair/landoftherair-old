
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToPotion extends Command {

  public name = '~GtP';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 2) return false;

    const [itemType, itemId] = splitArgs;
    const ground = gameState.getGroundItems(player.x, player.y);
    if(!ground[itemType]) return player.sendClientMessage('You do not see that item.');

    const item = find(ground[itemType], { uuid: itemId });
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    player.setPotionHand(item);
    room.removeItemFromGround(item);
  }

}
