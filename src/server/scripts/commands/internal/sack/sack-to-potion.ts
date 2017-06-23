
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToPotion extends Command {

  public name = '~StP';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    player.setPotionHand(item);
    player.takeItemFromSack(slot);
  }

}
