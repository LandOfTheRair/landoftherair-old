
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class PotionToLocker extends Command {

  public name = '~PtW';
  public format = 'LockerID';

  async execute(player: Player, { room, gameState, args }) {

    const lockerId = args;
    const item = player.potionHand;

    if(!item) return;

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.findLocker(player)) return;

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return;

    if(!this.addItemToContainer(player, locker, item)) return;

    player.setPotionHand(null);
    room.updateLocker(player, locker);
  }

}
