
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { StatName } from '../../../../shared/models/character';

export class ShowStats extends Command {

  static macroMetadata = {
    name: 'Show Stats',
    macro: 'show stats',
    icon: 'checklist',
    color: '#000000',
    mode: 'autoActivate'
  };

  public name = 'show stats';

  execute(player: Player, { room, args }) {
    player.sendClientMessage(`You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
    player.sendClientMessage(`Your allegiance lies with the ${player.allegiance}.`);

    Object.keys(player.baseStats).forEach((key: StatName) => {
      player.sendClientMessage(`Your ${key.toUpperCase()} is ${player.getTotalStat(key)} (BASE: ${player.getBaseStat(key)}).`);
    });
  }

}
