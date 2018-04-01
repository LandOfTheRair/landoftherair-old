
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { CommandExecutor } from '../../../helpers/command-executor';

export class DebugLag extends Command {

  public name = '~~lag';

  execute(player: Player, { room, t, gameState }) {
    CommandExecutor.executeCommand(player, '~~mobs', { room, t, gameState });
    CommandExecutor.executeCommand(player, '~~items', { room, t, gameState });
    CommandExecutor.executeCommand(player, '~~pos', { room, t, gameState });
    CommandExecutor.executeCommand(player, '~~ping', { room, t, gameState });
  }

}
