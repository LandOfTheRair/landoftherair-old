
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToPotion extends Command {

  public name = '~StP';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(item.itemClass !== 'Bottle') return room.sendClientLogMessage(client, 'That item is not a bottle.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(player.potionHand) return room.sendClientLogMessage(client, 'Your potion slot is occupied.');

    player.setPotionHand(item);
    player.takeItemFromSack(slot);
  }

}
