
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class SackToPouch extends Command {

  public name = '~StD';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack.getItemFromSlot(slot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.pouch, item);
    if(!added) return;

    player.sack.takeItemFromSlot(slot);
  }

}
