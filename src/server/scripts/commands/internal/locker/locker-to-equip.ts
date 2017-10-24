
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToEquip extends Command {

  public name = '~WtE';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slotStr, lockerId] = args.split(' ');
    const slot = +slotStr;

    if(!this.checkPlayerEmptyHand(player)) return;
    if(!this.findLocker(player)) return;

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return false;

    const isLockerUnlocked = await room.lockLocker(player, lockerId);
    if(!isLockerUnlocked) return false;

    const item = locker.getItemFromSlot(slot);
    if(!item) {
      room.unlockLocker(player, lockerId);
      return;
    }

    if(!player.canEquip(item)) {
      room.unlockLocker(player, lockerId);
      return player.sendClientMessage('You cannot equip that item.');
    }

    player.equip(item);
    locker.takeItemFromSlot(slot);
    room.updateLocker(player, locker);
    room.unlockLocker(player, lockerId);
  }

}
