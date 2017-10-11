
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

    const interactable = player.$$room.state.getInteractable(player.x, player.y);
    const stairs = interactable && includes(['ClimbUp', 'ClimbDown'], interactable.type) ? interactable : null;

    if(!stairs) return player.sendClientMessage('There are no grips here.');

    const { teleportMap, teleportX, teleportY } = stairs.properties;
    room.teleport(player, { x: teleportX, y: teleportY, newMap: teleportMap });
  }

}
