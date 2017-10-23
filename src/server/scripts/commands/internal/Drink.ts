
import { findLastIndex } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Drink extends Command {

  static macroMetadata = {
    name: 'Drink',
    macro: '~drink',
    icon: 'potion-ball',
    color: '#2020B2',
    mode: 'autoActivate',
    tooltipDesc: 'Drink a potion from your potion slot.'
  };

  public name = '~drink';

  execute(player: Player, { room, gameState, args }) {
    // const item = player.potionHand;
    // if(!item) return player.sendClientMessage('You do not have a potion to drink!');

    // if you have a potion, it takes priority, period
    if(player.potionHand) {
      player.useItem('potionHand');
      return;
    }

    if(player.rightHand && player.rightHand.effect && player.rightHand.effect.name === 'ExactHeal') {
      player.useItem('rightHand');
      return;
    }

    if(player.leftHand && player.leftHand.effect && player.leftHand.effect.name === 'ExactHeal') {
      player.useItem('leftHand');
      return;
    }

    const itemIndex = findLastIndex(player.sack.allItems, (item) => {
      if(!item.effect) return false;
      return item.effect.name === 'ExactHeal';
    });

    if(itemIndex === -1) return player.sendClientMessage('You have no potions to drink!');

    const item = player.sack.getItemFromSlot(itemIndex);
    player.setPotionHand(item);
    player.sack.takeItemFromSlot(itemIndex);
    player.useItem('potionHand');
  }

}
