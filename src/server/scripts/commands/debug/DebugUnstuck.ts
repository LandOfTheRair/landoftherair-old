
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugUnstuck extends Command {

  public name = '~~unstuck';

  execute(player: Player, { room, args }) {
    if(player.isInCombat) return player.sendClientMessage('You cannot do this action while in combat.');
    player.teleportToRespawnPoint();
    player.sendClientMessage('You are no longer stuck. Please remember not to abuse this.');
  }

}
