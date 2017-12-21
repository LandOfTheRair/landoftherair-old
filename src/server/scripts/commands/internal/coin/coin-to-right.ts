
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

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

    const item = await player.$$room.itemCreator.getGold(value);

    player.setRightHand(item);
    player.loseGold(value);
  }

}
