
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugReset extends Command {

  public name = '~~reset';

  execute(player: Player) {
    player.sendClientMessage('[debug] Resetting effects and recalculating stats');
    player.clearAllEffects();
    player.recalculateStats();
  }

}
