
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class GroundToLocker extends Command {

  public name = '~GtW';
  public format = 'ItemType ItemId LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 3) return false;

    const [itemType, itemId, lockerId] = splitArgs;
    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return;

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.findLocker(player)) return;

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return;

    if(!this.addItemToContainer(player, locker, item)) return;

    room.updateLocker(player, locker);
    room.removeItemFromGround(item);

  }

}
