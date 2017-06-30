
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class PotionToRight extends Command {

  public name = '~PtR';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.potionHand) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    this.trySwapRightToLeft(player);

    player.setRightHand(player.potionHand);
    player.setPotionHand(null);
  }

}
