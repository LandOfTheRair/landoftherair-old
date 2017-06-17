
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class Restore extends Command {

  public name = 'restore';

  static macroMetadata = {
    name: 'Restore',
    macro: 'restore',
    icon: 'quicksand',
    color: '#8A6948',
    mode: 'autoActivate'
  };

  execute(player: Player, { room, client, gameState, args }) {
  }

}
