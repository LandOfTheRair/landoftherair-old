
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class PartySay extends Command {

  public name = '~partysay';

  execute(player: Player, { args }) {
    if(!args) return false;
    if(!player.partyName) return player.sendClientMessage('You are not in a party!');

    player.$$room.partyManager.playerSendPartyMessage(player, args);
  }

}
