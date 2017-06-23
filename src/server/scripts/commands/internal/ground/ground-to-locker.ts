
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { MapLayer } from '../../../../../models/gamestate';

export class GroundToLocker extends Command {

  public name = '~GtW';
  public format = 'ItemType ItemId LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 3) return false;

    const [itemType, itemId, lockerId] = splitArgs;
    const ground = gameState.getGroundItems(player.x, player.y);
    if(!ground[itemType]) return player.sendClientMessage('You do not see that item.');

    const item = find(ground[itemType], { uuid: itemId });
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    // check if player standing on locker and region is same as room region
    const interactable = find(gameState.map.layers[MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });

    if(!interactable) return player.sendClientMessage('There is no locker there.');

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return false;

    if(!locker.canAccept(item)) return player.sendClientMessage('That item is not lockerable.');

    if(locker.isFull()) return player.sendClientMessage('That locker is full.');

    locker.putItemInLocker(item);
    player.setRightHand(null);
    room.updateLocker(player, locker);
    room.removeItemFromGround(item);
  }

}
