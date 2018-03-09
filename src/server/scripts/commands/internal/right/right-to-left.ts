
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToLeft extends Command {

  public name = '~RtL';
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
