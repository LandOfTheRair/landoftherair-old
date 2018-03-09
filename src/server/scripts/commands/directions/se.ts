
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

import { CommandExecutor } from '../../../helpers/command-executor';

export class SE extends Command {

  public name = ['se', 'southeast'];

  execute(player: Player, { room, gameState }) {
    CommandExecutor.executeCommand(player, '~move', { room, gameState, x: 1, y: 1 });
  }

}
