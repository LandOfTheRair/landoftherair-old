
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugPos extends Command {

  public name = '~~pos';

  execute(player: Player, { room, args }) {
    player.sendClientMessage(`Currently @ ${player.x}, ${player.y} on ${player.map}.`);
  }

}
