
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

import { CommandExecutor } from '../../../helpers/command-executor';

export class N extends Command {

  public name = ['n', 'north'];

  execute(player: Player, { room, gameState }) {
    CommandExecutor.executeCommand(player, '~move', { room, gameState, x: 0, y: -1 });
  }

}
