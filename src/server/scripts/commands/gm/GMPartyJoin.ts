
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMPartyJoin extends Command {

  public name = '@partyjoin';

  execute(player: Player, { room, args }) {

    if(player.party) return player.sendClientMessage(`You are already in the "${player.partyName}" party!`);
    if(!args) return player.sendClientMessage('You need to specify a party name!');

    const party = room.partyManager.getPartyByName(args);
    if(!party) return player.sendClientMessage('That party doesn\'t exist.');
    if(!party.leader) {
      player.sendClientMessage('That party doesn\'t have a leader. Not sure how this happened.');
      return;
    }

    room.partyManager.joinParty(player, args);
  }

}
