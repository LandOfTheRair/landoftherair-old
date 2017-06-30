
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToSack extends Command {

  public name = '~LtS';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    const item = player.leftHand;
    if(!item) return false;

    if(!player.addItemToSack(item)) return;
    player.setLeftHand(null);
  }

}
