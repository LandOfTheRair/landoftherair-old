
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

import { compact, endsWith } from 'lodash';

export class Look extends Command {

  static macroMetadata = {
    name: 'Look At Ground',
    macro: '~look',
    icon: 'semi-closed-eye',
    color: '#665600',
    mode: 'autoActivate'
  };

  public name = '~look';

  protected getStringForNum(num) {
    if(num === 1) return 'a';
    if(num <= 3)  return num;
    if(num <= 5)  return 'a handful of';
    if(num <= 7)  return 'a few';
    if(num <= 10) return 'some';
    if(num <= 20) return 'a pile of';
    if(num <= 50) return 'many';
    if(num <= 100) return 'a lot of';
    return 'zounds of';
  }

  execute(player: Player, { room, gameState, args }) {
    const items = gameState.getGroundItems(player.x, player.y);
    const numTypes = Object.keys(items);

    const typesWithNames = compact(numTypes.sort().map(itemType => {
      if(itemType === 'Coin' && items.Coin[0]) return `${items.Coin[0].value} ${items.Coin[0].name.toLowerCase()}${items.Coin[0].value > 1 ? 's' : ''}`;
      const len = items[itemType].length;
      if(len === 0) return '';
      const str = this.getStringForNum(len);
      const shouldS = !endsWith(itemType, 's');
      return `${str} ${itemType.toLowerCase()}${len > 1 && shouldS ? 's' : ''}`;
    }));

    if(typesWithNames.length === 0) {
      room.showGroundWindow(player);
      player.sendClientMessage('You see nothing of interest.');
      return;
    }

    if(typesWithNames.length > 1) {
      typesWithNames[typesWithNames.length - 1] = `and ${typesWithNames[typesWithNames.length - 1]}`;
    }
    player.sendClientMessage(`You see ${typesWithNames.join(', ')}.`);
    room.showGroundWindow(player);
  }

}
