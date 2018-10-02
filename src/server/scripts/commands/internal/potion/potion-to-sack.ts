
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PotionToSack extends Command {

  public name = '~PtS';
  public format = '';

  async execute(player: Player) {
    if(this.isAccessingLocker(player)) return;
    if(!player.potionHand) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!player.addItemToSack(player.potionHand)) return;
    player.setPotionHand(null);
  }

}
