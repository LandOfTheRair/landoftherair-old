
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class ShowSkills extends Command {

  static macroMetadata = {
    name: 'Show Skills',
    macro: 'show skills',
    icon: 'checklist',
    color: '#000000',
    mode: 'autoActivate',
    tooltipDesc: 'See all of your skills and skill levels in text form.'
  };

  public name = 'show skills';

  execute(player: Player, { room, args }) {
    player.sendClientMessage(`You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
    player.sendClientMessage(`Your allegiance lies with the ${player.allegiance}.`);

    Object.keys(player.allSkills).forEach(key => {
      player.sendClientMessage(`Your ${key.toUpperCase()} skill level is ${player.calcSkillLevel(key)}.`);
    });
  }

}
