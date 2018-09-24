
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class CoinToGround extends Command {

  public name = '~CtG';
  public format = 'Value';

  async execute(player: Player, { room, args }) {
    const value = +args;
    if(value <= 0 || value > player.currentGold || isNaN(value)) return;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    const item = await player.$$room.itemCreator.getGold(value);

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    player.spendGold(value, 'Service:CoinInHand');
  }

}
