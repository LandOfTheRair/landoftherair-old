
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToSack extends Command {

  public name = '~LtS';
  public format = '';

  execute(player: Player) {
    const item = player.leftHand;
    if(this.isAccessingLocker(player)) return;
    if(!item) return;

    if(!player.addItemToSack(item)) return;
    player.setLeftHand(null);
  }

}
