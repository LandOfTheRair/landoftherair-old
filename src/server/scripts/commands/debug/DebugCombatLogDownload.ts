
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugCombatLogDownload extends Command {

  public name = '~~combatlogdownload';

  execute(player: Player, { room, args }) {

    player.sendClientMessage('[combat logs] Downloading combat log...');
    room.updateLogSettings(player, { download: true });
  }

}
