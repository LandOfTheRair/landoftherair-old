
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class LeftToLocker extends Command {

  public name = '~LtW';
  public format = 'LockerID';

  async execute(player: Player, { room, gameState, args }) {

    if(this.isAccessingLocker(player)) return;

    const item = player.leftHand;
    if(!item) return;

    this.accessLocker(player);

    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, args);
    if(!locker) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.setLeftHand(null);
    room.updateLocker(player, locker);

    this.unaccessLocker(player);
  }

}
