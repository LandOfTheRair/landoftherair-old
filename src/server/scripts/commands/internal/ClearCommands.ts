
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class ClearCommands extends Command {

  static macroMetadata = {
    name: 'Clear Buffer',
    macro: '~clear',
    icon: 'ultrasound',
    color: '#000000',
    mode: 'autoActivate',
    key: 'ESCAPE',
    tooltipDesc: 'Clear the command buffer, negating all future commands.'
  };

  public name = '~clear';

  execute(player: Player, { room, gameState, args }) {
    player.$$actionQueue = [];
    player.sendClientMessage('Command buffer cleared.');
  }

}
