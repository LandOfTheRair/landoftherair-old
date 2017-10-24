
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToPotion extends Command {

  public name = '~WtP';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slotId, lockerId] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;
    if(!this.findLocker(player)) return;

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return false;

    const isLockerUnlocked = await room.lockLocker(player, lockerId);
    if(!isLockerUnlocked) return false;

    const item = locker.getItemFromSlot(+slotId);
    if(!item) {
      room.unlockLocker(player, lockerId);
      return;
    }

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    locker.takeItemFromSlot(+slotId);
    player.setPotionHand(item);
    room.updateLocker(player, locker);
    room.unlockLocker(player, lockerId);
  }

}
