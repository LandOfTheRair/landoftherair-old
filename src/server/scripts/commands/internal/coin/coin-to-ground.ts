
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class CoinToGround extends Command {

  public name = '~CtG';
  public format = 'Value';

  async execute(player: Player, { room, gameState, args }) {
    const value = +args;
    if(value <= 0 || value > player.gold || isNaN(value)) return false;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    const item = await ItemCreator.getGold(value);

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    player.loseGold(value);
  }

}
