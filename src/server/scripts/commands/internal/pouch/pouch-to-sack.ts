
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToSack extends Command {

  public name = '~DtS';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;
    if(isUndefined(args)) return false;

    const item = player.pouch.getItemFromSlot(slot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.sack, item);
    if(!added) return;

    player.pouch.takeItemFromSlot(slot);
  }

}
