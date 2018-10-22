
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToPotion extends Command {

  public name = '~WtP';
  public format = 'ItemSlot RegionID LockerID';

  async execute(player: Player, { room, args }) {
    const [slotId, regionId, lockerId] = args.split(' ');
    if(isUndefined(slotId)) return;

    if(this.isAccessingLocker(player)) return;
    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, regionId, lockerId, lockerRef.properties.lockerId === 'global');
    if(!locker) return this.unaccessLocker(player);

    const item = locker.getItemFromSlot(+slotId);
    if(!item) return this.unaccessLocker(player);

    if(item.itemClass !== 'Bottle') {
      this.unaccessLocker(player);
      return player.sendClientMessage('That item is not a bottle.');
    }

    locker.takeItemFromSlot(+slotId);
    player.setPotionHand(item);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
