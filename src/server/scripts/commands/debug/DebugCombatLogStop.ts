
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugCombatLogStop extends Command {

  public name = '~~combatlogstop';

  execute(player: Player, { room, args }) {
    player.sendClientMessage('[combat logs] No longer logging combat.');
    room.updateLogSettings(player, { stop: true });
  }

}
