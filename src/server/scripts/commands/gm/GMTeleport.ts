
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMTeleport extends Command {

  public name = '@teleport';
  public format = 'X Y [Map]';

  execute(player: Player, { room, args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const [x, y, map] = args.split(' ');

    if(!x || !y || args.length < 2) return false;

    room.teleport(player, { x: +x, y: +y, newMap: map });
  }
}
