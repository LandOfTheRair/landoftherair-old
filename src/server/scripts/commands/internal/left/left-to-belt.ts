
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToBelt extends Command {

  public name = '~LtB';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    const item = player.leftHand;
    if(!item) return;

    if(!player.addItemToBelt(item)) return;
    player.setLeftHand(null);
  }

}
