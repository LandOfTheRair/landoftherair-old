
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LockerToGround extends Command {

  public name = '~WtG';
  public format = 'ItemSlot LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotId, lockerId, amount] = args.split(' ');
    if(isUndefined(slotId)) return;

    this.accessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(+slotId, +amount);
    if(!item) return this.unaccessLocker(player);

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
