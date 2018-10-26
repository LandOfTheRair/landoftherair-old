
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

  execute(player: Player) {
    player.$$actionQueue = [];
    player.sendClientMessage({ message: 'Command buffer and target cleared.', target: null });
  }

}
