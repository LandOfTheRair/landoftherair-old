
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToBelt extends Command {

  public name = '~WtB';
  public format = 'ItemSlot RegionID LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotId, regionId, lockerId, amount] = args.split(' ');
    if(isUndefined(slotId)) return;

    const slot = +slotId;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(slot, +amount);
    if(!item) return this.unaccessLocker(player);

    if(!player.addItemToBelt(item)) return this.unaccessLocker(player);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
