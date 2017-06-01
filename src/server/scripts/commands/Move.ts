
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';

export class Move extends Command {

  public name = 'move';

  execute(player: Player, { x, y }) {
    x = Math.min(x, player.stats.move);
    y = Math.min(y, player.stats.move);

    player.x += x;
    player.y += y;

    const checkX = Math.abs(x);
    const checkY = Math.abs(y);

    if(checkX > checkY) {
      if(x > 0) {
        player.dir = 'E';
      } else if(x < 0) {
        player.dir = 'W';
      }

    } else if(checkY > x) {
      if(y > 0) {
        player.dir = 'S';
      } else if(y < 0) {
        player.dir = 'N';
      }
    }
  }

}
