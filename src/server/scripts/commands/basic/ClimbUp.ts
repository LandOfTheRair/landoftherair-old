
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { includes } from 'lodash';

export class ClimbUp extends Command {

  static macroMetadata = {
    name: 'Climb',
    macro: 'climb up',
    icon: 'ladder',
    color: '#D2691E',
    mode: 'autoActivate',
    tooltipDesc: 'Climb up or down on this tile.'
  };

  public name = ['climb up', 'climb down'];

  execute(player: Player, { room }) {

    const interactable = player.$$room.state.getInteractable(player.x, player.y);
    const stairs = interactable && includes(['ClimbUp', 'ClimbDown'], interactable.type) ? interactable : null;

    if(!stairs) return player.sendClientMessage('There are no grips here.');

    const { teleportMap, teleportX, teleportY, requireParty } = stairs.properties;

    if(requireParty && !player.party) return player.sendClientMessage('You must gather your party before venturing forth.');

    player.sendClientMessage(`You climb ${interactable.type === 'ClimbUp' ? 'up' : 'down'}.`);

    room.teleport(player, {
      x: teleportX,
      y: teleportY,
      newMap: teleportMap,
      zChange: interactable.type === 'ClimbUp' ? 1 : -1
    });
  }

}
