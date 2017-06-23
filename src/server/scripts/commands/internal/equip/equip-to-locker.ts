
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { MapLayer } from '../../../../../models/gamestate';

export class EquipToLocker extends Command {

  public name = '~EtW';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slot, lockerId] = args.split(' ');
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    // check if player standing on locker and region is same as room region
    const interactable = find(gameState.map.layers[MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });

    if(!interactable) return player.sendClientMessage('There is no locker there.');

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return false;

    if(!locker.canAccept(item)) return player.sendClientMessage('That item is not lockerable.');

    if(locker.isFull()) return player.sendClientMessage('That locker is full.');

    locker.putItemInLocker(item);
    player.unequip(slot);
    room.updateLocker(player, locker);

  }

}
