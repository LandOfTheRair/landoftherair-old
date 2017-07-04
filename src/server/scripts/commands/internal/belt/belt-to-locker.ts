
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToLocker extends Command {

  public name = '~BtW';
  public format = 'Slot LockerID';

  async execute(player: Player, { room, gameState, args }) {

    const [slot, lockerId] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.findLocker(player)) return;

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return;

    const item = player.belt.getItemFromSlot(slot);

    if(!this.addItemToContainer(player, locker, item)) return;

    player.belt.takeItemFromSlot(slot);
    room.updateLocker(player, locker);
  }

}
