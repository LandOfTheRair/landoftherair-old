
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';

export class ShowStats extends Command {

  public name = 'show_stats';

  execute(player: Player, { room, client, args }) {
    room.sendClientLogMessage(client, `You are ${player.name}, the ${player.ageString} level ${player.level} ${player.baseClass}.`);
    room.sendClientLogMessage(client, `Your allegiance lies with the ${player.allegiance}.`);

    Object.keys(player.stats).forEach(key => {
      room.sendClientLogMessage(client, `Your ${key.toUpperCase()} is ${player.stats[key]}.`);
    });
  }

}
