
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { CommandExecutor } from '../../../helpers/command-executor';

export class DebugBonuses extends Command {

  public name = '~~bonuses';

  execute(player: Player, { room, t, gameState }) {
    const str = Object.keys(room.bonusHelper.settings).map(x => `${x}=${room.bonusHelper.settings[x]}`).join(' ');
    player.sendClientMessage(`[debug] ${str}`);
  }

}
