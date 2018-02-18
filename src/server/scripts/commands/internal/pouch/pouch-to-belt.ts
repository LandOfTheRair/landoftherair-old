
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToBelt extends Command {

  public name = '~DtB';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;



    const item = player.pouch.getItemFromSlot(slot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.belt, item);
    if(!added) return;

    player.pouch.takeItemFromSlot(slot);
  }

}
