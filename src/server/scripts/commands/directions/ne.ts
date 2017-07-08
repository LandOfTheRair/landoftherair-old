
import { find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

import { CommandExecutor } from '../../../helpers/command-executor';

export class NE extends Command {

  public name = 'ne';

  execute(player: Player, { room, gameState }) {
    CommandExecutor.executeCommand(player, '~move', { room, gameState, x: 1, y: -1 });
  }

}
