
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterSetRegen extends Command {

  public name = '^regen';
  public format = 'Regen';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player) && !SubscriptionHelper.isTester(player)) return;

    const regen = Math.floor(+args);
    if(regen < 1 || isNaN(regen)) return false;

    TesterHelper.setRegen(player, regen);
  }

}
