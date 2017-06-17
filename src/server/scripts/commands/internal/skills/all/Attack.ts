
import { startsWith } from 'lodash';

import { Command } from '../../../../../base/Command';
import { Player } from '../../../../../../models/player';

export class Attack extends Command {

  public name = 'attack';

  static macroMetadata = {
    name: 'Attack',
    macro: 'attack',
    icon: 'blade-drag',
    color: '#530000',
    mode: 'lockActivation'
  };

  execute(player: Player, { room, client, gameState, args }) {
  }

}
