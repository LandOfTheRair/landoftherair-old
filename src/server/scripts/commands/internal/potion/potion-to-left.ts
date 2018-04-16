
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PotionToLeft extends Command {

  public name = '~PtL';
  public format = '';

  async execute(player: Player) {
    if(this.isAccessingLocker(player)) return;
    if(!player.potionHand) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    this.trySwapLeftToRight(player);

    player.setLeftHand(player.potionHand);
    player.setPotionHand(null);
  }

}
