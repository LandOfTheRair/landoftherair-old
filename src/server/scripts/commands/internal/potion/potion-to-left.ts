
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class PotionToLeft extends Command {

  public name = '~PtL';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    if(!player.potionHand) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    this.trySwapLeftToRight(player);

    player.setLeftHand(player.potionHand);
    player.setPotionHand(null);
  }

}
