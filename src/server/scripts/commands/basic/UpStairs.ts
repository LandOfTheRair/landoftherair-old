
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/maplayer';
import { find, includes } from 'lodash';

export class UpStairs extends Command {

  public name = ['up', 'down'];

  static macroMetadata = {
    name: 'Stairs',
    macro: 'up',
    icon: '3d-stairs',
    color: '#404040',
    mode: 'autoActivate'
  };

  execute(player: Player, { room, gameState, args }) {

    const stairs = find(gameState.map.layers[MapLayer.Interactables].objects, item => {
      return includes(['StairsUp', 'StairsDown'], item.type) && item.x/64 === player.x && (item.y/64)-1 === player.y;
    });

    if(!stairs) return player.sendClientMessage('There are no stairs here.');

    const { teleportMap, teleportX, teleportY } = stairs.properties;
    room.teleport(player, { x: teleportX, y: teleportY, newMap: teleportMap });
  }

}
