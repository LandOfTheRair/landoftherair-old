
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class PartyJoin extends Command {

  public name = 'party join';

  execute(player: Player, { room, args }) {

    if(player.party) return player.sendClientMessage(`You are already in the "${player.partyName}" party!`);
    if(!args) return player.sendClientMessage('You need to specify a party name!');

    const partyName = args.substring(0, 15).toLowerCase().trim().split(' ').join('');

    const party = room.partyManager.getPartyByName(partyName);
    if(!party) return player.sendClientMessage('That party doesn\'t exist.');
    if(!party.leader) {
      player.sendClientMessage('That party doesn\'t have a leader. Not sure how this happened.');
      return;
    }

    let foundLeader = false;

    room.state.getPlayersInRange(player, 4).forEach(otherPlayer => {
      if(otherPlayer.username === party.leader.username) foundLeader = true;
    });

    if(!foundLeader) return player.sendClientMessage('You don\'t see the leader of that party.');

    room.partyManager.joinParty(player, partyName);
  }

}
