
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToPotion extends Command {

  public name = '~LtP';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const left = player.leftHand;
    if(!left) return false;

    if(left.itemClass !== 'Bottle') return room.sendClientLogMessage(client, 'That item is not a bottle.');

    if(player.potionHand) return room.sendClientLogMessage(client, 'Your potion slot is occupied.');

    player.setPotionHand(left);
    player.setLeftHand(null);
  }

}
