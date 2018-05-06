
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugFlaggedSkills extends Command {

  public name = '~~flagged';

  execute(player: Player) {
    if(!player.$$flaggedSkills || player.$$flaggedSkills.length === 0) return player.sendClientMessage('No flagged skills.');

    player.sendClientMessage(`Flagged skills: ${player.$$flaggedSkills.join(', ')}`);
  }

}
