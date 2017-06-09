
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToGround extends Command {

  public name = '~StG';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    gameState.addItemToGround(player, item);
    room.showGroundWindow(client);
    player.takeItemFromSack(slot);
  }

}
