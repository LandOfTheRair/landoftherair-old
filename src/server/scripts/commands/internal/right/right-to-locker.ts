
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToLocker extends Command {

  public name = '~RtW';
  public format = 'LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const item = player.rightHand;
    if(!item) return;

    if(!this.findLocker(player)) return;

    const locker = await room.loadLocker(player, args);
    if(!locker) return;

    if(!this.addItemToContainer(player, locker, item)) return;

    player.setRightHand(null);
    room.updateLocker(player, locker);
  }

}
