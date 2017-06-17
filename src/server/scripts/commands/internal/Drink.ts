
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
  }

}
