
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToEquip extends Command {

  public name = '~BtE';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    const slot = +args;
    if(!isUndefined(args)) return false;

    if(this.isAccessingLocker(player)) return;

    const item = player.belt.getItemFromSlot(slot);
    if(!item) return false;

    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.equip(item);
    player.belt.takeItemFromSlot(slot);
  }

}
