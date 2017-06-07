
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class Look extends Command {

  public name = '~look';

  private getStringForNum(num) {
    if(num <= 3)  return num;
    if(num <= 5)  return 'a handful of';
    if(num <= 7)  return 'a few';
    if(num <= 10) return 'some';
    if(num <= 20) return 'a pile of';
    if(num <= 50) return 'many';
    if(num <= 100) return 'a lot of';
    return 'zounds of';
  }

  execute(player: Player, { room, client, gameState, args }) {
    const items = gameState.getGroundItems(player.x, player.y);
    const numTypes = Object.keys(items);

    if(numTypes.length === 0) {
      room.sendClientLogMessage(client, 'You see nothing of interest.');
      return;
    }

    const typesWithNames = numTypes.sort().map(itemType => {
      const len = items[itemType].length;
      const str = this.getStringForNum(len);
      return `${str} ${itemType.toLowerCase()}${len > 1 ? 's' : ''}`;
    });

    room.sendClientLogMessage(client, `You see ${typesWithNames.join(', ')}.`);
  }

}
