
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class GMTeleport extends Command {

  public name = '@teleport';
  public format = 'X Y [Map]';

  execute(player: Player, { gameState, args }) {
    if(!player.isGM) return;

    const [x, y, map] = args.split(' ');

    // TODO implement map teleporting

    player.x = +x;
    player.y = +y;

    gameState.resetPlayerStatus(player);
  }

}
