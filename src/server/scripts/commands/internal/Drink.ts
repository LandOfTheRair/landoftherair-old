
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class Drink extends Command {

  public name = '~drink';

  static macroMetadata = {
    name: 'Drink',
    macro: '~drink',
    icon: 'potion-ball',
    color: '#2020B2',
    mode: 'autoActivate'
  };

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.potionHand;
    if(!item) return room.sendClientLogMessage(client, 'You do not have a potion to drink!');

    player.useItem('potionHand');
  }

}
