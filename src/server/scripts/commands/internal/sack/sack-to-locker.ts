
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class SackToLocker extends Command {

  public name = '~StW';
  public format = 'Slot LockerID';

  async execute(player: Player, { room, gameState, args }) {

    const [slot, lockerId] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.findLocker(player)) return;

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return;

    const item = player.sack.getItemFromSlot(+slot);
    if(!item) return;

    if(!this.addItemToContainer(player, locker, item)) return;

    player.sack.takeItemFromSlot(+slot);
    room.updateLocker(player, locker);
  }

}
