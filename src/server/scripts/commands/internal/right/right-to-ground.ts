
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToGround extends Command {

  public name = '~RtG';
  public format = '';

  execute(player: Player, { room }) {
    if(this.isAccessingLocker(player)) return;
    if(!player.rightHand) return;
    room.addItemToGround(player, player.rightHand);
    player.setRightHand(null);
    room.showGroundWindow(player);
  }

}
