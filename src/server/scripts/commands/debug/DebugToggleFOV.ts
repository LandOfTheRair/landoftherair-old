
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugToggleFOV extends Command {

  public name = '~~togglefov';

  execute(player: Player, { room }) {
    player.sendClientMessage('[debug] Toggling FOV');
    room.sendRawData(player, { action: 'toggle_fov' });
  }

}
