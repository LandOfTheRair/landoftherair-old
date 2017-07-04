
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToLocker extends Command {

  public name = '~LtW';
  public format = 'LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const item = player.leftHand;
    if(!item) return false;

    if(!this.findLocker(player)) return;

    const locker = await room.loadLocker(player, args);
    if(!locker) return;

    if(!this.addItemToContainer(player, locker, item)) return;

    player.setLeftHand(null);
    room.updateLocker(player, locker);
  }

}
