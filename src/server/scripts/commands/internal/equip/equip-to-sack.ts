
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class EquipToSack extends Command {

  public name = '~EtS';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = args;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!item.isSackable) return room.sendClientLogMessage(client, 'That item is not sackable.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(player.fullSack()) return room.sendClientLogMessage(client, 'Your sack is full.');

    player.unequip(slot);
    player.addItemToSack(item);
  }

}
