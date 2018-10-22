
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToLeft extends Command {

  public name = '~WtL';
  public format = 'ItemSlot RegionID LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    const [slotId, regionId, lockerId, amount] = args.split(' ');
    if(isUndefined(slotId)) return;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(this.isAccessingLocker(player)) return;
    this.accessLocker(player);

    if(!this.checkPlayerEmptyHand(player)) return this.unaccessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(+slotId, +amount);
    if(!item) return this.unaccessLocker(player);

    this.trySwapLeftToRight(player);

    player.setLeftHand(item);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
