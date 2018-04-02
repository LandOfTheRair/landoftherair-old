
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class PartyCreate extends Command {

  public name = 'party create';

  execute(player: Player, { room, args }) {

    if(player.party) return player.sendClientMessage('You are already in a party!');
    if(!args) return player.sendClientMessage('You need to specify a party name!');

    const partyName = args.substring(0, 15).toLowerCase().trim().split(' ').join('');

    if(!partyName) return player.sendClientMessage('You need to specify a party name!');

    if(room.partyManager.getPartyByName(partyName)) return player.sendClientMessage('That party already exists.');

    room.partyManager.createParty(player, partyName);
    player.sendClientMessage(`Created the "${partyName}" party!`);
  }

}
