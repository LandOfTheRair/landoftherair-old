
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToPouch extends Command {

  public name = '~RtD';
  public format = '';

  execute(player: Player) {
    if(this.isAccessingLocker(player)) return;
    const item = player.rightHand;
    if(!item) return;

    if(!player.addItemToPouch(item)) return;
    player.setRightHand(null);
  }

}
