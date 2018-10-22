
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToLocker extends Command {

  public name = '~DtW';
  public format = 'Slot RegionID LockerID';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;

    const [slot, regionId, lockerId] = args.split(' ');

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    const item = player.pouch.getItemFromSlot(+slot);
    if(!item) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.pouch.takeItemFromSlot(+slot);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
