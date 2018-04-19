
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterSetHP extends Command {

  public name = '^hp';
  public format = 'HP';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player) && !player.$$room.subscriptionHelper.isTester(player)) return;

    const hp = Math.floor(+args);
    if(hp < 1 || isNaN(hp)) return false;

    TesterHelper.setHP(player, hp);
  }

}
