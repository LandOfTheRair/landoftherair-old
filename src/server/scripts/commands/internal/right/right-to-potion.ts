
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToPotion extends Command {

  public name = '~RtP';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const right = player.rightHand;
    if(!right) return false;
    if(right.itemClass !== 'Bottle') return room.sendClientLogMessage(client, 'That item is not a bottle.');

    if(player.potionHand) return room.sendClientLogMessage(client, 'Your potion slot is occupied.');

    player.setPotionHand(right);
    player.setRightHand(null);
  }

}
