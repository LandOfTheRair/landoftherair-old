
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

  execute(player: Player, { room, gameState, args }) {
    const item = player.potionHand;
    if(!item) return player.sendClientMessage('You do not have a potion to drink!');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full!');

    player.useItem('potionHand');
  }

}
