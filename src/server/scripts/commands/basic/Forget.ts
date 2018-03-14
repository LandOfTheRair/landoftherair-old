
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { StatName } from '../../../../shared/models/character';

export class Forget extends Command {

  public name = 'forget';
  public format = 'LocationName';

  async execute(player: Player, { args }) {
    if(!player.hasLearned('Teleport')) return player.sendClientMessage('You do not know how to teleport.');

    if(!args) return false;

    const didSucceed = await player.$$room.teleportHelper.forgetTeleport(player, args);
    if(!didSucceed) return;

    player.sendClientMessage('The memories of that location slip out of your mind.');
  }

}
