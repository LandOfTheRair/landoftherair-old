
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';

export class Move extends Command {

  public name = '~move';

  execute(client, player: Player, { map, x, y }) {
    x = Math.min(x, player.stats.move);
    y = Math.min(y, player.stats.move);

    player.x += x;
    player.y += y;

    if(player.x < 0) player.x = 0;
    if(player.y < 0) player.y = 0;

    if(player.x > map.width)  player.x = map.width;
    if(player.y > map.height) player.y = map.height;

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
