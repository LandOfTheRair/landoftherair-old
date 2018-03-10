
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterSetMP extends Command {

  public name = '^mp';
  public format = 'MP';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player) && !SubscriptionHelper.isTester(player)) return;

    const mp = Math.floor(+args);
    if(mp < 1 || isNaN(mp)) return false;

    TesterHelper.setMP(player, mp);
  }

}
