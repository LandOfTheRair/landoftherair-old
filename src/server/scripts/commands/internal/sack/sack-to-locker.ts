
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class SackToLocker extends Command {

  public name = '~StW';
  public format = 'Slot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;

    const [slot, lockerId] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    this.accessLocker(player);

    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = player.sack.getItemFromSlot(+slot);
    if(!item) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player);

    player.sack.takeItemFromSlot(+slot);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
