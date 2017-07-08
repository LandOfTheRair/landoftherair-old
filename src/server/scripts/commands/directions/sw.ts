
import { find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

import { CommandExecutor } from '../../../helpers/command-executor';

export class SW extends Command {

  public name = 'sw';

  execute(player: Player, { room, gameState }) {
    CommandExecutor.executeCommand(player, '~move', { room, gameState, x: -1, y: 1 });
  }

}
