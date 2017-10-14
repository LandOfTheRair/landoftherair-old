
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class CoinToLeft extends Command {

  public name = '~CtL';
  public format = 'Value';

  async execute(player: Player, { room, gameState, args }) {
    const value = +args;
    if(value <= 0 || value > player.gold || isNaN(value)) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    const item = await ItemCreator.getGold(value);

    player.setLeftHand(item);
    player.loseGold(value);
  }

}
