
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class PouchToLocker extends Command {

  public name = '~DtW';
  public format = 'Slot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;

    const [slot, lockerId] = args.split(' ');



    this.accessLocker(player);

    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = player.pouch.getItemFromSlot(+slot);
    if(!item) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.pouch.takeItemFromSlot(+slot);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
