
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToPouch extends Command {

  public name = '~LtD';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const item = player.leftHand;
    if(!item) return;

    if(!player.addItemToPouch(item)) return;
    player.setLeftHand(null);
  }

}
