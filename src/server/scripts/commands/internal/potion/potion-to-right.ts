
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class PotionToRight extends Command {

  public name = '~PtR';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.potionHand) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.rightHand && !player.leftHand) {
      player.setLeftHand(player.rightHand);
    }

    player.setRightHand(player.potionHand);
    player.setPotionHand(null);
  }

}
