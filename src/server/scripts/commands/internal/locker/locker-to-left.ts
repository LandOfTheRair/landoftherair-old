
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LockerToLeft extends Command {

  public name = '~WtL';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slotId, lockerId] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;
    if(!this.findLocker(player)) return;

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return false;

    const item = locker.takeItemFromSlot(+slotId);
    if(!item) return;

    this.trySwapLeftToRight(player);

    player.setLeftHand(item);
    room.updateLocker(player, locker);
  }

}
