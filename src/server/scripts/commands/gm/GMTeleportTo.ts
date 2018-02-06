
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/message-helper';

export class GMTeleportTo extends Command {

  public name = '@teleportto';
  public format = 'Charish';

  execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const playerName = args;
    if(!playerName) return false;

    let found = false;

    room.state.allPossibleTargets.forEach(checkTarget => {
      if(found || !MessageHelper.doesTargetMatchSearch(checkTarget, args)) return;
      room.setPlayerXY(player, checkTarget.x, checkTarget.y);
      checkTarget.z = player.z;
      found = true;

      player.sendClientMessage(`Teleporting to ${checkTarget.name} @ ${checkTarget.x},${checkTarget.y}...`);
    });

    if(!found) {
      player.sendClientMessage(`No target matches "${playerName}"`);
    }
  }
}
