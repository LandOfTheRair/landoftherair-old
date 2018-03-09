
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToPotion extends Command {

  public name = '~DtP';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;
    if(isUndefined(args)) return false;

    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    const item = player.pouch.getItemFromSlot(slot);
    if(!item) return false;

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    player.setPotionHand(item);
    player.pouch.takeItemFromSlot(slot);
  }

}
