
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class CoinToLeft extends Command {

  public name = '~CtL';
  public format = 'Value';

  async execute(player: Player, { args }) {
    const value = +args;
    if(value <= 0 || value > player.gold || isNaN(value)) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    this.trySwapLeftToRight(player);

    const item = await player.$$room.itemCreator.getGold(value);

    player.setLeftHand(item);
    player.loseGold(value);
  }

}
