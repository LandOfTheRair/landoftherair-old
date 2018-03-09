
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Restore extends Command {

  static macroMetadata = {
    name: 'Restore',
    macro: 'restore',
    icon: 'quicksand',
    color: '#8A6948',
    mode: 'autoActivate',
    tooltipDesc: 'Revive and go back to a respawn point.'
  };

  public name = 'restore';

  execute(player: Player) {
    if(!player.isDead()) return;

    player.restore(false);

    player.sendClientMessage('You are being welcomed back to life.');
  }

}
