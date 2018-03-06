
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugCombatLogStart extends Command {

  public name = '~~combatlogstart';

  execute(player: Player, { room, args }) {

    const logCount = args && !isNaN(+args) && +args > 0 ? +args : 1000

    player.sendClientMessage(`[combat logs] Logging up to ${logCount} log entries.`);

    room.updateLogSettings(player, { start: true, logCount });
  }

}
