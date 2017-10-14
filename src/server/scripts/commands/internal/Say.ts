
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Say extends Command {

  public name = '~say';

  execute(player: Player, { room, gameState, args }) {
    if(!args) return false;
    player.sendClientMessageToRadius({ name: player.name, message: args }, 6);
  }

}
