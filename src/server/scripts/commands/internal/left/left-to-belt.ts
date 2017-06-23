
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToBelt extends Command {

  public name = '~LtB';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    const item = player.leftHand;
    if(!item) return false;

    if(!item.isBeltable) return player.sendClientMessage('That item is not beltable.');

    if(player.fullBelt()) return player.sendClientMessage('Your belt is full.');

    player.addItemToBelt(item);
    player.setLeftHand(null);
  }

}
