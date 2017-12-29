
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class SackToPotion extends Command {

  public name = '~StP';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;



    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    const item = player.sack.getItemFromSlot(slot);
    if(!item) return false;

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    player.setPotionHand(item);
    player.sack.takeItemFromSlot(slot);
  }

}
