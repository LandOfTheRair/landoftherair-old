
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToEquip extends Command {

  public name = '~WtE';
  public format = 'ItemSlot RegionID LockerID';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotStr, regionId, lockerId] = args.split(' ');
    const slot = +slotStr;
    if(isUndefined(slotStr)) return;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    const item = locker.getItemFromSlot(slot);
    if(!item) return this.unaccessLocker(player);

    if(!player.canEquip(item)) {
      this.unaccessLocker(player);
      return player.sendClientMessage('You cannot equip that item.');
    }

    player.equip(item);
    locker.takeItemFromSlot(slot);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
