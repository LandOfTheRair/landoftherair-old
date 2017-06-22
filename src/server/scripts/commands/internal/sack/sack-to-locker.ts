
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { MapLayer } from '../../../../../models/gamestate';

export class SackToLocker extends Command {

  public name = '~StW';
  public format = 'Slot LockerID';

  async execute(player: Player, { room, client, gameState, args }) {

    const [slot, lockerId] = args.split(' ');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    // check if player standing on locker and region is same as room region
    const interactable = find(gameState.map.layers[MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });

    if(!interactable) return room.sendClientLogMessage(client, 'There is no locker there.');

    const item = player.sack[+slot];
    if(!item) return false;

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return false;

    if(!locker.canAccept(item)) return room.sendClientLogMessage(client, 'That item is not lockerable.');

    if(locker.isFull()) return room.sendClientLogMessage(client, 'That locker is full.');

    locker.putItemInLocker(item);
    player.takeItemFromSack(slot);
    room.updateLocker(client, player, locker);
  }

}
