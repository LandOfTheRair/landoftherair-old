
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/world/locker-helper';

export class LockerToLeft extends Command {

  public name = '~WtL';
  public format = 'ItemSlot LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    const [slotId, lockerId, amount] = args.split(' ');
    if(isUndefined(slotId)) return;

    if(this.isAccessingLocker(player)) return;
    this.accessLocker(player);

    if(!this.checkPlayerEmptyHand(player)) return this.unaccessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(+slotId, +amount);
    if(!item) return this.unaccessLocker(player);

    this.trySwapLeftToRight(player);

    player.setLeftHand(item);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
