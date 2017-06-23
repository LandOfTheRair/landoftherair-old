
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { MapLayer } from '../../../../../models/gamestate';

export class LeftToLocker extends Command {

  public name = '~LtW';
  public format = 'LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const item = player.leftHand;
    if(!item) return false;

    // check if player standing on locker and region is same as room region
    const interactable = find(gameState.map.layers[MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });

    if(!interactable) return player.sendClientMessage('There is no locker there.');

    const locker = await room.loadLocker(player, args);
    if(!locker) return false;

    if(!locker.canAccept(item)) return player.sendClientMessage('That item is not lockerable.');

    if(locker.isFull()) return player.sendClientMessage('That locker is full.');

    locker.putItemInLocker(item);
    player.setLeftHand(null);
    room.updateLocker(player, locker);
  }

}
