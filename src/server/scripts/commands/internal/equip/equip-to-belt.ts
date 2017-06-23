
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class EquipToBelt extends Command {

  public name = '~EtB';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = args;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!item.isBeltable) return player.sendClientMessage('That item is not beltable.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(player.fullBelt()) return player.sendClientMessage('Your belt is full.');

    player.unequip(slot);
    player.addItemToBelt(item);
  }

}
