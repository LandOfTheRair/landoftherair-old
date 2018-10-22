
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToLocker extends Command {

  public name = '~LtW';
  public format = 'RegionID LockerID';

  async execute(player: Player, { room, args }) {

    if(this.isAccessingLocker(player)) return;

    const [regionId, lockerId] = args.split(' ');

    const item = player.leftHand;
    if(!item) return;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.setLeftHand(null);
    room.updateLocker(player, locker);

    this.unaccessLocker(player);
  }

}
