
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class GroundToLocker extends Command {

  public name = '~GtW';
  public format = 'ItemType ItemId RegionID LockerID';

  async execute(player: Player, { room, args }) {
    const splitArgs = args.split(' ');
    if(this.isAccessingLocker(player)) return;
    if(splitArgs.length < 4) return;

    const [itemType, itemId, regionId, lockerId] = splitArgs;
    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return;
    if(!this.takeItemCheck(player, item)) return;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    // remove and re-add the item to update the ounces on the item
    if(!this.addItemToContainer(player, locker, item)) {
      room.removeItemFromGround(item);
      room.addItemToGround(player, item);
      return this.unaccessLocker(player, locker);
    }

    room.updateLocker(player, locker);
    room.removeItemFromGround(item);
    this.unaccessLocker(player);
  }

}
