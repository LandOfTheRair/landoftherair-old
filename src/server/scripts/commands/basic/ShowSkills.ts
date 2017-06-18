
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class ShowSkills extends Command {

  public name = 'show_skills';

  static macroMetadata = {
    name: 'Show Skills',
    macro: 'show_skills',
    icon: 'checklist',
    color: '#000000',
    mode: 'autoActivate'
  };

  execute(player: Player, { room, client, args }) {
    room.sendClientLogMessage(client, `You are ${player.name}, the ${player.ageString} level ${player.level} ${player.baseClass}.`);
    room.sendClientLogMessage(client, `Your allegiance lies with the ${player.allegiance}.`);

    Object.keys(player.skills).forEach(key => {
      room.sendClientLogMessage(client, `Your ${key.toUpperCase()} skill level is ${player.calcSkillLevel(key)}.`);
    });
  }

}
