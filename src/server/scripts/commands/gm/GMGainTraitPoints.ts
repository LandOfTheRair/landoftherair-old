
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';

export class GMGainTraitPoints extends Command {

  public name = '@tp';
  public format = 'Amount';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    const traitGain = +args;
    player.skillTree.reset();
    player.skillTree.gainResetPoints(traitGain);
    player.skillTree.gainTraitPoints(traitGain);
  }
}
