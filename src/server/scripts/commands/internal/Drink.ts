
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Drink extends Command {

  static macroMetadata = {
    name: 'Drink',
    macro: '~drink',
    icon: 'potion-ball',
    color: '#2020B2',
    mode: 'autoActivate',
    tooltipDesc: 'Drink a potion from your potion slot.'
  };

  public name = '~drink';

  execute(player: Player, { room, gameState, args }) {
    const item = player.potionHand;
    if(!item) return player.sendClientMessage('You do not have a potion to drink!');

    player.useItem('potionHand');
  }

}
