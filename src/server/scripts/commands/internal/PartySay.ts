
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class PartySay extends Command {

  public name = '~partysay';

  execute(player: Player, { args }) {
    if(!args) return false;
    if(!player.partyName) return player.sendClientMessage('You are not in a party!');

    args = MessageHelper.cleanMessage(args);
    player.$$room.partyManager.playerSendPartyMessage(player, args);
  }

}
