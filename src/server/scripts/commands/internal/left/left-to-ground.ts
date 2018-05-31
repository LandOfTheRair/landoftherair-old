
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToGround extends Command {

  public name = '~LtG';
  public format = '';

  execute(player: Player, { room }) {
    if(!player.leftHand) return;
    if(this.isAccessingLocker(player)) return;

    const item = player.leftHand;
    player.setLeftHand(null);
    room.addItemToGround(player, item);
    room.showGroundWindow(player);
  }

}
