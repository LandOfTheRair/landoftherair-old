
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class PotionToSack extends Command {

  public name = '~PtS';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    if(!player.potionHand) return false;

    if(!this.checkPlayerEmptyHand(player)) return false;

    if(!player.addItemToSack(player.potionHand)) return;
    player.setPotionHand(null);
  }

}
