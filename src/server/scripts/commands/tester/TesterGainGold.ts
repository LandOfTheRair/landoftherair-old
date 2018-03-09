
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';
import { TesterHelper } from '../../../helpers/tester-helper';

export class TesterGainGold extends Command {

  public name = '^gold';
  public format = 'Gold';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player) && !SubscriptionHelper.isTester(player)) return;

    const gold = Math.floor(+args);
    if(gold < 1 || isNaN(gold)) return false;

    TesterHelper.gainGold(player, gold);
  }

}
