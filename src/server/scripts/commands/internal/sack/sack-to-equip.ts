
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToEquip extends Command {

  public name = '~StE';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');
    if(!player.canEquip(item)) return room.sendClientLogMessage(client, 'You cannot equip that item.');

    player.equip(item);
    player.takeItemFromSack(slot);
  }

}
