
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/world/locker-helper';

export class PotionToLocker extends Command {

  public name = '~PtW';
  public format = 'LockerID';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;

    const lockerId = args;
    const item = player.potionHand;

    if(!item) return;

    this.accessLocker(player);

    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    if(!this.addItemToContainer(player, locker, item)) return this.unaccessLocker(player, locker);

    player.setPotionHand(null);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
