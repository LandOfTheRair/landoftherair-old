
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToPotion extends Command {

  public name = '~LtP';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    const left = player.leftHand;
    if(!left) return false;

    if(left.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    player.setPotionHand(left);
    player.setLeftHand(null);
  }

}
