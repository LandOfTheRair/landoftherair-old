
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class Say extends Command {

  public name = '~say';

  execute(player: Player, { args }) {
    if(!args) return false;
    if(player.$$account.isMuted) return;

    args = MessageHelper.cleanMessage(args);
    player.sendClientMessageToRadius({ name: player.name, message: args }, 6);
  }

}
