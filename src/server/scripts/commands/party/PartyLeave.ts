
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class PartyLeave extends Command {

  public name = 'party leave';

  execute(player: Player, { room }) {
    if(!player.party) return player.sendClientMessage('You are not in a party!');
    const partyName = player.partyName;

    room.partyManager.leaveParty(player);
    player.sendClientMessage(`You left the "${partyName}" party!`);

    if(!room.canPartyAction) {
      room.kickOut(player);
    }
  }

}
