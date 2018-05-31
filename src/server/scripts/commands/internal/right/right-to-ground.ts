
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToGround extends Command {

  public name = '~RtG';
  public format = '';

  execute(player: Player, { room }) {
    if(this.isAccessingLocker(player)) return;
    if(!player.rightHand) return;

    const item = player.rightHand;
    player.setRightHand(null);
    room.addItemToGround(player, item);
    room.showGroundWindow(player);
  }

}
