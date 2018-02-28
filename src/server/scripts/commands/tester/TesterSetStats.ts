
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';
import { TesterHelper } from '../../../helpers/tester-helper';

export class TesterSetStats extends Command {

  public name = '^stats';
  public format = 'StatValue';

  async execute(player: Player, { room, gameState, args }) {
    if(!SubscriptionHelper.isGM(player) && !SubscriptionHelper.isTester(player)) return;

    const level = +args;
    if(level < 1 || isNaN(level)) return false;

    TesterHelper.setStats(player, level);
  }

}
