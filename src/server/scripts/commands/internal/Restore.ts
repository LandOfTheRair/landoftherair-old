
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Restore extends Command {

  static macroMetadata = {
    name: 'Restore',
    macro: 'restore',
    icon: 'quicksand',
    color: '#8A6948',
    mode: 'autoActivate'
  };

  public name = 'restore';

  execute(player: Player, { room, gameState, args }) {
    if(!player.isDead()) return;

    player.restore(false);

    player.sendClientMessage('You are being welcomed back to life.');
  }

}
