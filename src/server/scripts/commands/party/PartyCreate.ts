
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class PartyCreate extends Command {

  public name = 'party create';

  execute(player: Player, { room, args }) {

    if(player.party) return player.sendClientMessage('You are already in a party!');
    if(!args) return player.sendClientMessage('You need to specify a party name!');

    args = args.substring(0, 15);

    if(room.partyManager.getPartyByName(args)) return player.sendClientMessage('That party already exists.');

    room.partyManager.createParty(player, args);
    player.sendClientMessage(`Created the "${args}" party!`);
  }

}
