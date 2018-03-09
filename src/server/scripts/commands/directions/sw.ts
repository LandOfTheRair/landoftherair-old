
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

import { CommandExecutor } from '../../../helpers/command-executor';

export class SW extends Command {

  public name = ['sw', 'southwest'];

  execute(player: Player, { room, gameState }) {
    CommandExecutor.executeCommand(player, '~move', { room, gameState, x: -1, y: 1 });
  }

}
