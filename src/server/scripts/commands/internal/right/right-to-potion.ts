
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToPotion extends Command {

  public name = '~RtP';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    const right = player.rightHand;
    if(!right) return;
    if(right.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    player.setPotionHand(right);
    player.setRightHand(null);
  }

}
