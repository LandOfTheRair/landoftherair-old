
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';
import { TesterHelper } from '../../../helpers/tester-helper';

export class TesterResetTraits extends Command {

  public name = '^traits';
  public format = '';

  async execute(player: Player) {
    if(!SubscriptionHelper.isGM(player) && !SubscriptionHelper.isTester(player)) return;

    TesterHelper.resetTraits(player);
  }

}
