
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToLocker extends Command {

  public name = '~BtW';
  public format = 'Slot RegionId LockerID';

  async execute(player: Player, { room, args }) {

    const [slot, regionId, lockerId] = args.split(' ');

    if(this.isAccessingLocker(player)) return;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    const item = player.belt.getItemFromSlot(slot);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.belt.takeItemFromSlot(slot);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
