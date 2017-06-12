
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/gamestate';
import { find, includes } from 'lodash';

export class ClimbUp extends Command {

  public name = ['climbup', 'climbdown'];

  execute(player: Player, { room, client, gameState, args }) {

    const stairs = find(gameState.map.layers[MapLayer.Interactables].objects, item => {
      return includes(['ClimbUp', 'ClimbDown'], item.type) && item.x/64 === player.x && (item.y/64)-1 === player.y;
    });

    if(!stairs) return room.sendClientLogMessage(client, 'There are no grips here.');

    const { teleportMap, teleportX, teleportY } = stairs.properties;
    room.teleport(client, player, { x: teleportX, y: teleportY, newMap: teleportMap });
  }

}
