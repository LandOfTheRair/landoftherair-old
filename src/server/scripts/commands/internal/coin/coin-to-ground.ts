
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class CoinToGround extends Command {

  public name = '~CtG';
  public format = 'Value';

  async execute(player: Player, { room, gameState, args }) {
    const value = +args;
    if(value <= 0 || value > player.gold || isNaN(value)) return false;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    let item;
    try {
      item = await ItemCreator.getItemByName('Gold Coin');
      item.value = value;
    } catch(e) {
      player.sendClientMessage(`Warning: "Gold Coin" does not exist.`);
      return;
    }

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    player.loseGold(value);
  }

}
