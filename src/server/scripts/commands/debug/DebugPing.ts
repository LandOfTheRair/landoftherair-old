
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugPing extends Command {

  public name = '~~ping';

  execute(player: Player, { t, room, args }) {
    const now = Date.now();
    player.sendClientMessage(`Ping-pong! Your ping is ${now - t}ms (< 100ms is optimal).`);
  }

}
