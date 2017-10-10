
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/maplayer';
import { find, includes } from 'lodash';

export class ClimbUp extends Command {

  static macroMetadata = {
    name: 'Climb',
    macro: 'climb up',
    icon: 'ladder',
    color: '#D2691E',
    mode: 'autoActivate'
  };

  public name = ['climb up', 'climb down'];

  execute(player: Player, { room, gameState, args }) {

    const stairs = find(gameState.map.layers[MapLayer.Interactables].objects, item => {
      return includes(['ClimbUp', 'ClimbDown'], item.type)
          && item.x / 64 === player.x && (item.y / 64) - 1 === player.y;
    });

    if(!stairs) return player.sendClientMessage('There are no grips here.');

    const { teleportMap, teleportX, teleportY } = stairs.properties;
    room.teleport(player, { x: teleportX, y: teleportY, newMap: teleportMap });
  }

}
