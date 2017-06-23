
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToBelt extends Command {

  public name = '~RtB';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    const item = player.rightHand;
    if(!item) return false;

    if(!item.isBeltable) return player.sendClientMessage('That item is not beltable.');

    if(player.fullBelt()) return player.sendClientMessage('Your belt is full.');

    player.addItemToBelt(item);
    player.setRightHand(null);
  }

}
