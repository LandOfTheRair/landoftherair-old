
import { isNumber, includes } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { ValidMaterialItems } from '../../../../../shared/helpers/material-storage-layout';
import { MaterialStorageHelper } from '../../../../helpers/tradeskill/material-storage-helper';

export class DepositAll extends Command {

  public name = '~depositall';
  public format = '';

  async execute(player: Player, { room, args }) {
    if(this.isBusy(player)) return;

    this.accessLocker(player);

    const lockerRef = this.findLocker(player);
    if(!lockerRef) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, 'Material', 'material', true);
    if(!locker) return this.unaccessLocker(player);

    const takeSlots = [];
    player.sack.allItems.forEach((item, idx) => {
      if(!isNumber(ValidMaterialItems[item.name])) return;
      const msg = locker.addItem(item, null, { maxSize: MaterialStorageHelper.getTotalSizeAvailable(player) });
      if(!includes(msg, 'Not all of the')) {
        takeSlots.push(idx);
      } else {
        player.sendClientMessage(msg);
      }
    });

    player.sack.takeItemFromSlots(takeSlots);

    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
