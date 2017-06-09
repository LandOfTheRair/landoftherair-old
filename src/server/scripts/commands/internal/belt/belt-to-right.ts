
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToRight extends Command {

  public name = '~BtR';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.belt[slot];
    if(!item) return false;

    if(player.rightHand) return room.sendClientLogMessage(client, 'Your right hand is full.');

    player.rightHand = item;
    player.takeItemFromBelt(slot);
  }

}
