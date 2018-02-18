
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LockerToPouch extends Command {

  public name = '~WtD';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotId, lockerId] = args.split(' ');

    const slot = +slotId;


    this.accessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(slot);
    if(!item) return this.unaccessLocker(player);

    if(!player.addItemToPouch(item)) return this.unaccessLocker(player);
    room.updateLocker(player, locker);
    this.unaccessLocker(player)
  }

}
