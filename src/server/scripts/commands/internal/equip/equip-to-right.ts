
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class EquipToRight extends Command {

  public name = '~EtR';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = args;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(player.rightHand) return room.sendClientLogMessage(client, 'Your right hand is full.');

    player.unequip(slot);
    player.rightHand = item;
  }

}
