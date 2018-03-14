
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { StatName } from '../../../../shared/models/character';
import { Stunned } from '../../../effects/antibuffs/Stunned';

export class Memorize extends Command {

  public name = 'memorize';
  public format = 'LocationName';

  async execute(player: Player, { args }) {
    if(!player.hasLearned('Teleport')) return player.sendClientMessage('You do not know how to teleport.');

    if(!args) return false;

    const didSucceed = await player.$$room.teleportHelper.memorizeTeleport(player, args);
    if(!didSucceed) return;

    player.sendClientMessage('You spend a moment taking in your surroundings...');

    const stunned = new Stunned({ shouldNotShowMessage: true });
    stunned.duration = 3;
    stunned.cast(player, player);
  }

}
