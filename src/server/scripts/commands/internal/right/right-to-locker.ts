
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { MapLayer } from '../../../../../models/gamestate';

export class RightToLocker extends Command {

  public name = '~RtW';
  public format = 'LockerID';

  async execute(player: Player, { room, client, gameState, args }) {
    const item = player.rightHand;
    if(!item) return false;

    // check if player standing on locker and region is same as room region
    const interactable = find(gameState.map.layers[MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });

    if(!interactable) return room.sendClientLogMessage(client, 'There is no locker there.');

    const locker = await room.loadLocker(player, args);
    if(!locker) return false;

    if(!locker.canAccept(item)) return room.sendClientLogMessage(client, 'That item is not lockerable.');

    if(locker.isFull()) return room.sendClientLogMessage(client, 'That locker is full.');

    locker.putItemInLocker(item);
    player.setRightHand(null);
    room.updateLocker(client, player, locker);
  }

}
