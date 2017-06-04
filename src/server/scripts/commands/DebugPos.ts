
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';

export class DebugPos extends Command {

  public name = '~~pos';

  execute(player: Player, { room, client, args }) {
    room.sendClientLogMessage(client, `Currently @ ${player.x}, ${player.y} on ${player.map}.`);
  }

}
