
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { find, includes } from 'lodash';
import { Logger } from '../../../logger';

export class PartyJoin extends Command {

  public name = 'party join';

  execute(player: Player, { room, gameState, args }) {

    if(player.party) return player.sendClientMessage(`You are already in the "${player.partyName}" party!`);
    if(!args) return player.sendClientMessage('You need to specify a party name!');

    const party = room.partyManager.getPartyByName(args);
    if(!party) return player.sendClientMessage('That party doesn\'t exist.');
    if(!party.leader) {
      Logger.error(new Error('Party does not have a leader somehow?'), party);
      player.sendClientMessage('That party doesn\'t have a leader. Not sure how this happened.');
      return;
    }

    let foundLeader = false;

    room.state.getPlayersInRange(player, 4).forEach(otherPlayer => {
      if(otherPlayer.username === party.leader.username) foundLeader = true;
    });

    if(!foundLeader) return player.sendClientMessage('You don\'t see the leader of that party.');

    room.partyManager.joinParty(player, args);
  }

}
