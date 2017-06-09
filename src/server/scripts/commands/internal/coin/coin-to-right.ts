
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class CoinToRight extends Command {

  public name = '~CtR';
  public format = 'Value';

  async execute(player: Player, { room, client, gameState, args }) {
    const value = +args;
    if(value <= 0 || value > player.gold || isNaN(value)) return false;
    if(player.rightHand) return room.sendClientLogMessage(client, 'Your right hand is full.');

    let item;
    try {
      item = await ItemCreator.getItemByName('Gold Coin');
      item.value = value;
    } catch(e) {
      room.sendClientLogMessage(client, `Warning: "Gold Coin" does not exist.`);
      return;
    }

    player.setRightHand(item);
    player.loseGold(value);
  }

}
