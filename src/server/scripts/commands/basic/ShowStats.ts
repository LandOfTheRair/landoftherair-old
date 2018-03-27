
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { StatName } from '../../../../shared/models/character';

export class ShowStats extends Command {

  static macroMetadata = {
    name: 'Show Stats',
    macro: 'show stats',
    icon: 'checklist',
    color: '#000000',
    mode: 'autoActivate',
    tooltipDesc: 'See all of your stats and their base level in text form.'
  };

  public name = 'show stats';
  public format = '[all]';

  execute(player: Player, { args }) {
    player.sendClientMessage(`You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
    player.sendClientMessage(`Your allegiance lies with ${player.allegiance === 'None' ? 'no one' : `the ${player.allegiance}`}.`);

    const baseKeys = args
      ? Object.keys(player.baseStats)
      : ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'luk', 'con', 'cha', 'hp', 'mp', 'offense', 'defense', 'armorClass'];

    baseKeys.forEach((key: StatName) => {
      player.sendClientMessage(`Your ${key.toUpperCase()} is ${player.getTotalStat(key)} (BASE: ${player.getBaseStat(key)}).`);
    });
  }

}
