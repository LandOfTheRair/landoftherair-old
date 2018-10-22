
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToLocker extends Command {

  public name = '~RtW';
  public format = 'RegionID LockerID';

  async execute(player: Player, { room, args }) {

    const [regionId, lockerId] = args.split(' ');

    if(this.isAccessingLocker(player)) return;

    const item = player.rightHand;
    if(!item) return;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.setRightHand(null);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
