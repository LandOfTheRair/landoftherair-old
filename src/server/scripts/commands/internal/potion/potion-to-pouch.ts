
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PotionToPouch extends Command {

  public name = '~PtD';
  public format = '';

  async execute(player: Player) {
    if(this.isAccessingLocker(player)) return;
    if(!player.potionHand) return false;

    if(!this.checkPlayerEmptyHand(player)) return false;

    if(!player.addItemToPouch(player.potionHand)) return;
    player.setPotionHand(null);
  }

}
