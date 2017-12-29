
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LockerToRight extends Command {

  public name = '~WtR';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slotId, lockerId] = args.split(' ');

    if(this.isAccessingLocker(player)) return;

    this.accessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(+slotId);
    if(!item) return this.unaccessLocker(player);

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
