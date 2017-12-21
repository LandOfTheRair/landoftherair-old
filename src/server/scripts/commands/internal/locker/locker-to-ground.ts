
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LockerToGround extends Command {

  public name = '~WtG';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slotId, lockerId] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;
    if(!this.findLocker(player)) return;

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return false;

    const item = locker.takeItemFromSlot(+slotId);
    if(!item) return;

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    room.updateLocker(player, locker);
  }

}
