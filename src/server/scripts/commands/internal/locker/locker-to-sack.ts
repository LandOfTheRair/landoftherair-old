
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LockerToSack extends Command {

  public name = '~WtS';
  public format = 'ItemSlot LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotId, lockerId, amt] = args.split(' ');
    if(isUndefined(slotId)) return;

    const slot = +slotId;
    const amount = +amt;

    this.accessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(slot, amount);
    if(!item) return this.unaccessLocker(player);

    if(!player.addItemToSack(item)) return this.unaccessLocker(player);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
