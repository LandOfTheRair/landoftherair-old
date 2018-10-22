
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToGround extends Command {

  public name = '~WtG';
  public format = 'ItemSlot RegionID LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotId, regionId, lockerId, amount] = args.split(' ');
    if(isUndefined(slotId)) return;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(+slotId, +amount);
    if(!item) return this.unaccessLocker(player);

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
