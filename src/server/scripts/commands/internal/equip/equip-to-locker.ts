
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { LockerHelper } from '../../../../helpers/locker-helper';

export class EquipToLocker extends Command {

  public name = '~EtW';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {
    const [slot, lockerId] = args.split(' ');
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.findLocker(player)) return;

    const locker = await LockerHelper.loadLocker(player, lockerId);
    if(!locker) return;

    if(!this.addItemToContainer(player, locker, item)) return;

    player.unequip(slot);
    room.updateLocker(player, locker);

  }

}
