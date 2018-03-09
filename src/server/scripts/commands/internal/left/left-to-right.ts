
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToRight extends Command {

  public name = '~LtR';
  public format = '';

  execute(player: Player) {
    if(this.isAccessingLocker(player)) return;
    const left = player.leftHand;
    const right = player.rightHand;

    player.setLeftHand(right, false);
    player.setRightHand(left, false);
    player.recalculateStats();
  }

}
