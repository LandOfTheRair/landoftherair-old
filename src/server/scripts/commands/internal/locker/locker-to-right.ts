
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToRight extends Command {

  public name = '~WtR';
  public format = 'ItemSlot LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    const [slotId, lockerId, amt] = args.split(' ');
    if(isUndefined(slotId)) return;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(this.isAccessingLocker(player)) return;

    this.accessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(+slotId, +amt);
    if(!item) return this.unaccessLocker(player);

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
