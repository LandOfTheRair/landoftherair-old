
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class ClearCommands extends Command {

  public name = '~clear';

  static macroMetadata = {
    name: 'Clear Buffer',
    macro: '~clear',
    icon: 'ultrasound',
    color: '#000000',
    mode: 'autoActivate',
    key: 'ESCAPE'
  };

  execute(player: Player, { room, gameState, args }) {
    player.$$actionQueue = [];
    player.sendClientMessage('Command buffer cleared.');
  }

}
