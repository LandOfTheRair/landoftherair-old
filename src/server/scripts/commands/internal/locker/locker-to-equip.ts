
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LockerToEquip extends Command {

  public name = '~WtE';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotStr, lockerId] = args.split(' ');
    const slot = +slotStr;
    if(isUndefined(slotStr)) return;

    this.accessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
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
