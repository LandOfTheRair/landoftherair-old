
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class EquipToBelt extends Command {

  public name = '~EtB';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    const slot = args;
    if(this.isAccessingLocker(player)) return;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!player.addItemToBelt(item)) return;
    player.unequip(slot);
  }

}
