
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToSack extends Command {

  public name = '~WtS';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slotId, lockerId] = args.split(' ');

    const slot = +slotId;

    if(!this.checkPlayerEmptyHand(player)) return;
    if(!this.findLocker(player)) return;

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return false;

    const item = locker.takeItemFromSlot(slot);
    if(!item) return;

    if(!player.addItemToSack(item)) return;
    room.updateLocker(player, locker);
  }

}
