
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class EquipToLocker extends Command {

  public name = '~EtW';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, args }) {
    const [slot, lockerId] = args.split(' ');
    if(this.isAccessingLocker(player)) return;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    this.accessLocker(player);

    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.unequip(slot);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
