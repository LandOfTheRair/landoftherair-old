
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class ShowStats extends Command {

  public name = 'show_stats';

  static macroMetadata = {
    name: 'Show Stats',
    macro: 'show_stats',
    icon: 'checklist',
    color: '#000000',
    mode: 'autoActivate'
  };

  execute(player: Player, { room, args }) {
    player.sendClientMessage(`You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
    player.sendClientMessage(`Your allegiance lies with the ${player.allegiance}.`);

    Object.keys(player.stats).forEach(key => {
      player.sendClientMessage(`Your ${key.toUpperCase()} is ${player.getTotalStat(key)} (BASE: ${player.getTotalStat(key)}).`);
    });
  }

}
