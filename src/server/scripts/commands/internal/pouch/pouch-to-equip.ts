
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToEquip extends Command {

  public name = '~DtE';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.pouch.getItemFromSlot(slot);
    if(!item) return false;

    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.equip(item);
    player.pouch.takeItemFromSlot(slot);
  }

}
