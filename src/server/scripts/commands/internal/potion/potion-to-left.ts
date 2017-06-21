
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class PotionToLeft extends Command {

  public name = '~PtL';
  public format = '';

  async execute(player: Player, { room, client, gameState, args }) {
    if(!player.potionHand) return false;

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');
    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    player.setLeftHand(player.potionHand);
    player.setPotionHand(null);
  }

}
