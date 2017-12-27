
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToSack extends Command {

  public name = '~BtS';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;

    if(this.isAccessingLocker(player)) return;
    if(!this.checkPlayerEmptyHand(player)) return;

    const item = player.belt.getItemFromSlot(slot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.sack, item);
    if(!added) return;

    player.belt.takeItemFromSlot(slot);
  }

}
