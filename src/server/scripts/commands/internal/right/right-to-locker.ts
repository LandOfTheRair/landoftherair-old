
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class RightToLocker extends Command {

  public name = '~RtW';
  public format = 'LockerID';

  async execute(player: Player, { room, gameState, args }) {

    if(this.isAccessingLocker(player)) return;

    const item = player.rightHand;
    if(!item) return;

    this.accessLocker(player);

    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, args);
    if(!locker) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.setRightHand(null);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
