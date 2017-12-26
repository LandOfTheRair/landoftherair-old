
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MapLayer } from '../../../../shared/models/maplayer';
import { find, includes } from 'lodash';

export class UpStairs extends Command {

  static macroMetadata = {
    name: 'Stairs',
    macro: 'up',
    icon: '3d-stairs',
    color: '#404040',
    mode: 'autoActivate',
    tooltipDesc: 'Go up or down stairs on this tile.'
  };

  public name = ['up', 'down'];

  execute(player: Player, { room, gameState, args }) {

    const interactable = player.$$room.state.getInteractable(player.x, player.y, true);
    const stairs = interactable && includes(['StairsUp', 'StairsDown'], interactable.type) ? interactable : null;

    if(!stairs) return player.sendClientMessage('There are no stairs here.');

    const { teleportMap, teleportX, teleportY, requireParty } = stairs.properties;

    if(requireParty && !player.party) return player.sendClientMessage('You must gather your party before venturing forth.');

    room.teleport(player, {
      x: teleportX,
      y: teleportY,
      newMap: teleportMap,
      zChange: interactable.type === 'StairsUp' ? 1 : -1
    });
  }

}
