
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToEquip extends Command {

  public name = '~BtE';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.belt[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.equip(item);
    player.takeItemFromBelt(slot);
  }

}
