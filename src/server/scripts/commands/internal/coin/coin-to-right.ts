
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class CoinToRight extends Command {

  public name = '~CtR';
  public format = 'Value';

  async execute(player: Player, { room, gameState, args }) {
    const value = +args;
    if(value <= 0 || value > player.gold || isNaN(value)) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.rightHand && !player.leftHand) {
      player.setLeftHand(player.rightHand);
    }

    let item;
    try {
      item = await ItemCreator.getItemByName('Gold Coin');
      item.value = value;
    } catch(e) {
      player.sendClientMessage(`Warning: "Gold Coin" does not exist.`);
      return;
    }

    player.setRightHand(item);
    player.loseGold(value);
  }

}
