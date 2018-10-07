
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { includes } from 'lodash';
import { HolidayHelper } from '../../../../shared/helpers/holiday-helper';

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

  execute(player: Player, { room }) {

    const interactable = player.$$room.state.getInteractable(player.x, player.y, true);
    const stairs = interactable && includes(['StairsUp', 'StairsDown'], interactable.type) ? interactable : null;

    if(!stairs) return player.sendClientMessage('There are no stairs here.');

    const { teleportMap, teleportX, teleportY, requireParty, subscriberOnly, requireHoliday } = stairs.properties;

    if(subscriberOnly && !player.$$room.subscriptionHelper.isSubscribed(player)) return player.sendClientMessage('You found an easter egg! Sadly, it\'s spoiled.');
    if(requireParty && !player.party) return player.sendClientMessage('You must gather your party before venturing forth.');
    if(requireHoliday && !HolidayHelper.isHoliday(requireHoliday)) return player.sendClientMessage(`That location is only seasonally open during "${requireHoliday}"!`);

    player.sendClientMessage(`You ${interactable.type === 'StairsUp' ? 'ascend' : 'descend'} the staircase.`);

    room.teleport(player, {
      x: teleportX,
      y: teleportY,
      newMap: teleportMap,
      zChange: interactable.type === 'StairsUp' ? 1 : -1
    });
  }

}
