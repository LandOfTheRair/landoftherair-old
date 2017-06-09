
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class EquipToBelt extends Command {

  public name = '~EtB';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = args;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!item.isBeltable) return room.sendClientLogMessage(client, 'That item is not beltable.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(player.fullBelt()) return room.sendClientLogMessage(client, 'Your belt is full.');

    player.unequip(slot);
    player.addItemToBelt(item);
  }

}
