
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class PotionToSack extends Command {

  public name = '~PtS';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.potionHand) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    if(!player.potionHand.isSackable) return player.sendClientMessage('That item is not sackable.');

    if(player.fullSack()) return player.sendClientMessage('Your sack is full.');

    player.addItemToSack(player.potionHand);
    player.setPotionHand(null);
  }

}
