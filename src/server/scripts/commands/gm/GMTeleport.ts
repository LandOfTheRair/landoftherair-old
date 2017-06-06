
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class GMTeleport extends Command {

  public name = '@teleport';
  public format = 'X Y [Map]';

  execute(player: Player, { client, room, gameState, args }) {
    if(!player.isGM) return;

    const [x, y, map] = args.split(' ');

    if(!x || !y || args.length < 2) return false;

    room.teleport(client, player, { x: +x, y: +y, newMap: map });
  }
}
