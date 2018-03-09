
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/world/locker-helper';

export class GroundToLocker extends Command {

  public name = '~GtW';
  public format = 'ItemType ItemId LockerID';

  async execute(player: Player, { room, args }) {
    const splitArgs = args.split(' ');
    if(this.isAccessingLocker(player)) return;
    if(splitArgs.length < 3) return;

    const [itemType, itemId, lockerId] = splitArgs;
    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return;

    this.accessLocker(player);

    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
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
